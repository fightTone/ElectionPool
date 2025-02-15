import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { User, CheckCircle2 } from 'lucide-react';

const VotingInterface = () => {
  const [step, setStep] = useState(1);
  const [voterName, setVoterName] = useState('');
  const [votes, setVotes] = useState({});
  const [candidates, setCandidates] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch candidates when component mounts
    fetch('http://127.0.0.1:8080/api/candidates')
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

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (voterName.trim().length < 2) {
      setError('Please enter a valid name (minimum 2 characters)');
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
      const response = await fetch('http://127.0.0.1:8080/api/submit-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_name: voterName,
          votes: votes
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to submit vote');
      }
    } catch (err) {
      setError('Error submitting vote: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <CardContent>
            <div className="text-center">Loading candidates...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold">Thank You for Voting!</h2>
              <p className="text-gray-600">Your vote has been successfully recorded.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Election Poll 2025</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 text-red-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Please enter your name to begin voting
                </label>
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="flex-1 outline-none"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Continue to Vote
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {candidates && Object.entries(candidates).map(([position, data]) => (
                <div key={position} className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-lg">
                    {position}
                    <span className="text-sm text-gray-500 ml-2">
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
                              ? 'bg-blue-50 border-blue-500 border text-blue-700' 
                              : 'hover:bg-gray-50 border border-gray-200'
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
                className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition font-medium"
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