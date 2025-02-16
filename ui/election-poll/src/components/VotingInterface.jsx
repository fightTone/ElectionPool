import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { User, CheckCircle2, X } from 'lucide-react';
import { BARANGAYS } from '../constants/barangays';

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
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-6">
          <CardContent>
            <div className="text-center">Loading candidates...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <Card className="w-full max-w-md p-6 relative">
          <button
            onClick={handleCloseError}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-800/50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <CardContent>
            <div className="text-center text-red-500 mb-4">{error}</div>
            <button
              onClick={handleCloseError}
              className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-500 transition"
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
      <div className="flex justify-center items-start min-h-screen pt-20">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold text-gray-100">Thank You for Voting!</h2>
              <p className="text-gray-400">Your vote has been successfully recorded.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto border-gray-800">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl">Election Poll 2025</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 text-red-700 relative">
              <AlertDescription>{error}</AlertDescription>
              <button
                onClick={handleCloseError}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-200/50"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Please enter your name to begin voting
                  </label>
                  <div className="flex items-center space-x-2 border border-gray-800 rounded-md p-2 bg-gray-900/50">
                    <User className="w-5 h-5 text-green-500" />
                    <input
                      type="text"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      className="flex-1 outline-none bg-transparent text-gray-100 placeholder-gray-500 w-full"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Enter your contact number
                  </label>
                  <div className="flex items-center space-x-2 border border-gray-800 rounded-md p-2 bg-gray-900/50">
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="flex-1 outline-none bg-transparent text-gray-100 placeholder-gray-500 w-full"
                      placeholder="e.g., 09123456789"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select your barangay
                  </label>
                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-800 bg-gray-900/50 text-gray-100 outline-none"
                  >
                    <option value="">Select Barangay</option>
                    {BARANGAYS.map((brgy) => (
                      <option key={brgy} value={brgy} className="bg-gray-900">
                        {brgy}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-medium py-2 rounded-md hover:bg-green-500 transition"
              >
                Continue to Vote
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {candidates && Object.entries(candidates).map(([position, data]) => (
                <div key={position} className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-base sm:text-lg">
                    {position}
                    <span className="text-xs sm:text-sm text-gray-500 ml-2 block sm:inline mt-1 sm:mt-0">
                      (Select {position === "MEMBER, SANGGUNIANG PANLUNGSOD" ? "up to 8" : "1"})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {data.candidates.map((candidate) => {
                      const isSelected = (votes[position] || []).includes(candidate);
                      return (
                        <button
                          key={candidate}
                          onClick={() => handleVoteChange(position, candidate)}
                          className={`w-full text-left p-3 rounded transition ${
                            isSelected 
                              ? 'bg-green-500/20 border-green-500 border text-green-400' 
                              : 'hover:bg-gray-800/50 border border-gray-800'
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
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-500 transition font-medium"
              >
                Submit Votes
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingInterface;