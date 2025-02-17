import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { User, CheckCircle2, X } from 'lucide-react';
import { BARANGAYS } from '../constants/barangays';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    // Fetch candidates when component mounts
    fetch('http://3.84.6.19:8080/api/candidates')
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
      const response = await fetch(`http://3.84.6.19:8080/api/check-contact/${number}`);
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
      const response = await fetch('http://3.84.6.19:8080/api/submit-vote', {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-2xl pt-8 px-4"
    >
      <Card>
        <CardHeader>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle className="text-center">Cast Your Vote</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 ? (
            <motion.form 
              onSubmit={handleNameSubmit} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-4">
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

              {/* Add Privacy Agreement Section */}
              <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
                <div className="prose prose-sm dark:prose-invert">
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
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">
                    I agree to the data privacy terms and consent to the processing of my information
                  </span>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={!hasAgreed}
                whileHover={{ scale: hasAgreed ? 1.02 : 1 }}
                whileTap={{ scale: hasAgreed ? 0.98 : 1 }}
                className={`w-full py-2.5 rounded-md font-medium transition-all ${
                  hasAgreed 
                    ? 'bg-primary text-primary-foreground hover:opacity-90' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Continue to Vote
              </motion.button>
            </motion.form>
          ) : (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {candidates && Object.entries(candidates).map(([position, data]) => (
                <div key={position}>
                  <h3 className="text-lg font-semibold mb-4">
                    {position}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
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
              
              <button
                onClick={handleSubmit}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:opacity-90 transition-opacity font-medium mt-8"
              >
                Submit Votes
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VotingInterface;