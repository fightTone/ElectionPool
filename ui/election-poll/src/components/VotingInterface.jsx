import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Add this import
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { User, CheckCircle2, X } from 'lucide-react';
import { BARANGAYS } from '../constants/barangays';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const VotingInterface = () => {
  const [step, setStep] = useState(1);
  const [voterName, setVoterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [votes, setVotes] = useState({});
  const [candidates, setCandidates] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [barangay, setBarangay] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Fetch candidates when component mounts
    fetch(`${API_BASE_URL}/candidates`)
      .then(res => res.json())
      .then(data => {
        setCandidates(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load candidates');
        setLoading(false);
      });
  }, []);

  const checkContactNumber = async (number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-contact/${number}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail);
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (voterName.trim().length < 2) {
      setError('Please enter a valid name (minimum 2 characters)');
      return;
    }
    if (!contactNumber || contactNumber.length < 11) {
      setError('Please enter a valid contact number');
      return;
    }
    if (!barangay) {
      setError('Please select your barangay');
      return;
    }
    if (!hasAgreed) {
      setError('Please accept the data privacy agreement to continue');
      return;
    }

    // Check if contact number has already voted
    const canProceed = await checkContactNumber(contactNumber);
    if (!canProceed) {
      return;
    }

    setError('');
    setStep(2);
  };

  const handleVoteChange = (position, candidate) => {
    const currentVotes = votes[position] || [];
    const maxVotes = position === "MEMBER, SANGGUNIANG PANLUNGSOD" ? 8 : 1;

    if (currentVotes.includes(candidate)) {
      setVotes({
        ...votes,
        [position]: currentVotes.filter(vote => vote !== candidate)
      });
    } else if (currentVotes.length < maxVotes) {
      setVotes({
        ...votes,
        [position]: [...currentVotes, candidate]
      });
    } else {
      setError(`You can only select ${maxVotes} candidate(s) for ${position}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_name: voterName,
          contact_number: contactNumber,
          barangay: barangay,
          votes: votes
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
      } else {
        const data = await response.json();
        // Display the error message from the backend
        setError(data.detail || 'Failed to submit vote');
        // If it's a duplicate contact number error, reset to step 1
        if (data.detail?.includes('already been used')) {
          setStep(1);
        }
      }
    } catch (err) {
      setError('Error submitting vote: ' + err.message);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleReviewSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirmVote = async () => {
    await handleSubmit();
    setShowConfirmation(false);
  };

  const handleEditVotes = () => {
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl pt-8">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <X className="h-10 w-10 text-red-500 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleCloseError}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-md pt-8">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You for Voting!</h2>
            <p className="text-muted-foreground">Your vote has been successfully recorded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-2xl pt-8 px-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Review Your Votes</CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Please review your selections before final submission
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Voter Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Voter Information</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{voterName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Contact:</dt>
                    <dd className="font-medium">{contactNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Barangay:</dt>
                    <dd className="font-medium">{barangay}</dd>
                  </div>
                </dl>
              </div>

              {/* Selected Candidates */}
              <div className="space-y-4">
                <h3 className="font-medium">Selected Candidates</h3>
                {Object.entries(candidates).map(([position, data]) => (
                  <div key={position} className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">{position}</h4>
                    {votes[position]?.length > 0 ? (
                      <ul className="space-y-1">
                        {votes[position].map((candidate) => (
                          <li 
                            key={candidate}
                            className="flex items-center text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                            {candidate}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No candidate selected</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleEditVotes}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Edit Votes
                </button>
                <button
                  onClick={handleConfirmVote}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
      >
        <div className="max-w-3xl mx-auto">
          <Card className="mx-auto">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg text-center">Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="max-w-2xl mx-auto">
                {step === 1 ? (
                  <motion.form 
                    onSubmit={handleNameSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Form fields with improved spacing */}
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={voterName}
                            onChange={(e) => setVoterName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Number</label>
                        <input
                          type="tel"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          className="w-full px-4 py-2 border rounded-md bg-background"
                          placeholder="e.g., 09123456789"
                          maxLength={11}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Barangay</label>
                        <select
                          value={barangay}
                          onChange={(e) => setBarangay(e.target.value)}
                          className="w-full px-4 py-2 border rounded-md bg-background appearance-none"
                        >
                          <option value="">Select your barangay</option>
                          {BARANGAYS.map((brgy) => (
                            <option key={brgy} value={brgy}>{brgy}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Privacy Agreement with better alignment */}
                    <div className="space-y-4 rounded-lg border border-border p-4 sm:p-6 bg-muted/20">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <h4 className="text-sm font-semibold mb-2">Data Privacy Agreement</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          By proceeding, you agree that:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>Your provided information will be used solely for vote verification purposes</li>
                          <li>Your contact number will be used only to prevent duplicate voting</li>
                          <li>Your personal data will be handled securely and confidentially</li>
                          <li>Your voting choices will remain anonymous in the results</li>
                        </ul>
                        <Link 
                          to="/privacy-policy"
                          className="text-sm text-primary hover:underline block mt-4"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read full Privacy Policy
                        </Link>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hasAgreed}
                          onChange={(e) => setHasAgreed(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm">
                          I have read and agree to the Privacy Policy and consent to the processing of my information
                        </span>
                      </label>
                    </div>

                    {/* Continue button */}
                    <div className="flex justify-center pt-4">
                      <motion.button
                        type="submit"
                        disabled={!hasAgreed}
                        className={`w-full sm:w-2/3 py-2.5 rounded-md font-medium transition-all ${
                          hasAgreed 
                            ? 'bg-primary text-primary-foreground hover:opacity-90' 
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        Continue to Vote
                      </motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Voting options with improved layout */}
                    {candidates && Object.entries(candidates).map(([position, data]) => (
                      <div key={position} className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          {position}
                          <span className="text-sm font-normal text-muted-foreground block sm:inline sm:ml-2">
                            (Select {position === "MEMBER, SANGGUNIANG PANLUNGSOD" ? "up to 8" : "1"})
                          </span>
                        </h3>
                        <div className="grid gap-2">
                          {data.candidates.map((candidate) => {
                            const isSelected = (votes[position] || []).includes(candidate);
                            return (
                              <button
                                key={candidate}
                                onClick={() => handleVoteChange(position, candidate)}
                                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary text-primary border-2' 
                                    : 'border border-border hover:bg-muted/50'
                                }`}
                              >
                                {candidate}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Submit button */}
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleReviewSubmit}
                        className="w-full sm:w-2/3 bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-opacity font-medium mt-8"
                      >
                        Review & Submit Votes
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default VotingInterface;