/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  const registeredVoters = new Map();
  const votedVoters = new Set();
  const votes = {};
  candidates.forEach(c => { votes[c.id] = 0; });

  return {
    registerVoter(voter) {
      if (!voter || !voter.id || !voter.name || voter.age === undefined) return false;
      if (voter.age < 18) return false;
      if (registeredVoters.has(voter.id)) return false;
      registeredVoters.set(voter.id, voter);
      return true;
    },
    castVote(voterId, candidateId, onSuccess, onError) {
      if (!registeredVoters.has(voterId)) return onError('Voter not registered');
      if (!(candidateId in votes)) return onError('Candidate not found');
      if (votedVoters.has(voterId)) return onError('Already voted');
      votes[candidateId]++;
      votedVoters.add(voterId);
      return onSuccess({ voterId, candidateId });
    },
    getResults(sortFn) {
      const results = candidates.map(c => ({ ...c, votes: votes[c.id] }));
      if (sortFn) return results.sort(sortFn);
      return results.sort((a, b) => b.votes - a.votes);
    },
    getWinner() {
      const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
      if (totalVotes === 0) return null;
      return candidates.reduce((winner, c) => {
        return votes[c.id] > votes[winner.id] ? c : winner;
      }, candidates[0]);
    }
  };
}

export function createVoteValidator(rules) {
  return (voter) => {
    if (!voter) return { valid: false, reason: 'Voter is null or undefined' };
    for (const field of rules.requiredFields || []) {
      if (voter[field] === undefined) return { valid: false, reason: `Missing required field: ${field}` };
    }
    if (voter.age < (rules.minAge || 18)) return { valid: false, reason: 'Voter is too young' };
    return { valid: true };
  };
}

export function countVotesInRegions(regionTree) {
  if (!regionTree || typeof regionTree !== 'object') return 0;
  const subTotal = Array.isArray(regionTree.subRegions)
    ? regionTree.subRegions.reduce((sum, r) => sum + countVotesInRegions(r), 0)
    : 0;
  return (regionTree.votes || 0) + subTotal;
}

export function tallyPure(currentTally, candidateId) {
  return { ...currentTally, [candidateId]: (currentTally[candidateId] || 0) + 1 };
}
