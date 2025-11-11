import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Trophy, Clock, Star } from 'lucide-react';

const LeaderboardView = ({ onBack }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('points');

  const departments = [
    'Customer Experience', 'IT', 'Technical Operations', 'Technical Services',
    'Finance', 'Human Resources', 'Legal', 'PPR', 'EFR', 'HSE', 'Corp Comms.', 'Commercial'
  ];

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await window.storage.list('game:', true);
      
      if (result && result.keys) {
        const allGames = [];
        for (const key of result.keys) {
          try {
            const gameData = await window.storage.get(key, true);
            if (gameData && gameData.value) {
              const parsed = JSON.parse(gameData.value);
              allGames.push(parsed);
            }
          } catch (error) {
            console.error(`Error loading game ${key}:`, error);
          }
        }
        setLeaderboardData(allGames);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    const colors = {
      'Fraud Prevention Legend': 'text-yellow-500',
      'Vigilant Guardian': 'text-green-500',
      'Aware Defender': 'text-blue-500',
      'Learning Responder': 'text-purple-500',
      'Needs Development': 'text-red-500'
    };
    return colors[rating] || 'text-gray-500';
  };

  const getRatingIcon = (rating) => {
    if (rating === 'Fraud Prevention Legend') return '🏆';
    if (rating === 'Vigilant Guardian') return '🛡️';
    if (rating === 'Aware Defender') return '⚔️';
    if (rating === 'Learning Responder') return '📚';
    return '📊';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredData = leaderboardData.filter(game => 
    filterDepartment === 'all' || game.department === filterDepartment
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'time') return a.completionTime - b.completionTime;
    if (sortBy === 'date') return new Date(b.timestamp) - new Date(a.timestamp);
    return 0;
  });

  const topScorers = sortedData.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Trophy className="w-12 h-12 text-yellow-500 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
                <p className="text-gray-600">International Fraud Awareness Week Challenge</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading leaderboard...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No teams have completed the challenge yet!</p>
              <p className="text-gray-500">Be the first to set a record!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Filter by Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="points">Highest Points</option>
                    <option value="time">Fastest Time</option>
                    <option value="date">Most Recent</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Teams</p>
                    <p className="text-3xl font-bold text-blue-600">{leaderboardData.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Highest Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.max(...leaderboardData.map(g => g.points))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Fastest Time</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatTime(Math.min(...leaderboardData.map(g => g.completionTime)))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {topScorers.map((game, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      index === 0 ? 'border-yellow-400 bg-yellow-50' :
                      index === 1 ? 'border-gray-400 bg-gray-50' :
                      index === 2 ? 'border-orange-400 bg-orange-50' :
                      'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-500' :
                          index === 2 ? 'text-orange-500' :
                          'text-gray-400'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-lg text-gray-800">{game.teamName}</h3>
                            <span className="text-2xl">{getRatingIcon(game.rating)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{game.department}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.teamMembers.slice(0, 3).map((member, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {member}
                              </span>
                            ))}
                            {game.teamMembers.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                +{game.teamMembers.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <div className="text-2xl font-bold text-gray-800">{game.points}</div>
                          <div className="text-xs text-gray-600">points</div>
                        </div>
                        
                        <div className="text-center">
                          <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <div className="text-2xl font-bold text-gray-800">{formatTime(game.completionTime)}</div>
                          <div className="text-xs text-gray-600">time</div>
                        </div>

                        <div className="text-center min-w-[120px]">
                          <div className={`text-sm font-bold ${getRatingColor(game.rating)}`}>
                            {game.rating}
                          </div>
                          <div className="text-xs text-gray-500">{game.date}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sortedData.length > 10 && (
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Showing top 10 of {sortedData.length} teams
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FraudAwarenessGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [teamName, setTeamName] = useState('');
  const [department, setDepartment] = useState('');
  const [teamMembers, setTeamMembers] = useState(['', '', '', '']);
  const [currentScene, setCurrentScene] = useState(0);
  const [points, setPoints] = useState(0);
  const [teamSpeed, setTeamSpeed] = useState(0);
  const [decisions, setDecisions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [storyPath, setStoryPath] = useState('main');
  const [saveStatus, setSaveStatus] = useState('');

  const departments = [
    'Customer Experience', 'IT', 'Technical Operations', 'Technical Services',
    'Finance', 'Human Resources', 'Legal', 'PPR', 'EFR', 'HSE', 'Corp Comms.', 'Commercial'
  ];

  const gameScenarios = {
    0: {
      id: 0,
      title: "Monday Morning at EKEDC",
      description: "It's 8:00 AM on Monday. You arrive at the office with your morning coffee when your colleague from Customer Experience rushes over, looking concerned. 'I need your help,' she says urgently. 'I've been reviewing weekend activity and something's very wrong with Account #78452. There were 15 failed login attempts between 2-3 AM, then suddenly a successful login from an IP address in another state. Within minutes, they changed the email, phone number, and requested the billing address be updated to a completely different location.' She shows you her screen - the account belongs to a high-value commercial customer who's been with EKEDC for years. What's your next move?",
      image: "🌅",
      choices: [
        {
          text: "Act immediately - suspend the account and call an emergency meeting with IT, Commercial, and Customer Experience",
          points: 25,
          feedback: "Excellent leadership! Your quick action prevented a major breach. The fraudster was attempting to redirect payments.",
          nextScene: 1,
          path: 'vigilant'
        },
        {
          text: "Contact the customer directly using the phone number on file to verify these changes",
          points: 20,
          feedback: "Smart verification approach! The customer confirms they made NO changes. Crisis averted, but speed is crucial in fraud cases.",
          nextScene: 1,
          path: 'vigilant'
        },
        {
          text: "Set up monitoring on the account to gather more evidence before acting",
          points: 5,
          feedback: "While evidence is important, delays give fraudsters time to act. The account was accessed again an hour later.",
          nextScene: 2,
          path: 'delayed'
        },
        {
          text: "Assume the customer is traveling for business and approve the changes",
          points: -10,
          feedback: "Dangerous assumption! The fraudster successfully redirected the next payment before the real customer noticed. Never assume.",
          nextScene: 2,
          path: 'compromised'
        }
      ]
    },
    1: {
      id: 1,
      title: "The Web Spreads Wider",
      description: "Your swift action on the suspicious account paid off. Within an hour, IT flags something alarming: the same attack pattern has been attempted on 12 other high-value accounts overnight. Then at 10:30 AM, employees across multiple departments start reporting something else - they're receiving official-looking emails from 'management@ekkedc.com' (note the double 'k'). The emails claim there's an emergency audit and request employees to verify their login credentials by clicking a link. The emails even include the CEO's digital signature. Your phone rings - it's Corp Comms, IT, and HR on a conference call. Everyone's looking to your department for guidance. The emails are still arriving. What do you do?",
      image: "🚨",
      choices: [
        {
          text: "Lead the response - immediately send company-wide alert, coordinate with IT to block the domain, and set up a fraud response team",
          points: 35,
          feedback: "Outstanding crisis management! Your coordinated response stopped 89% of employees from clicking the link. True leadership!",
          nextScene: 3,
          path: 'hero'
        },
        {
          text: "Work with IT to block the emails while HR drafts a warning for all departments",
          points: 25,
          feedback: "Good collaborative approach. The warning went out within 30 minutes, limiting the damage significantly.",
          nextScene: 3,
          path: 'vigilant'
        },
        {
          text: "Alert only your department first to protect your team, then coordinate with others",
          points: 10,
          feedback: "Your team is safe, but 23 employees in other departments clicked the link in those crucial minutes. Fraud requires company-wide action!",
          nextScene: 4,
          path: 'delayed'
        },
        {
          text: "Forward the email to IT and wait for their security team to handle it",
          points: 5,
          feedback: "IT was overwhelmed with reports. By the time they responded, the fraudsters had collected credentials from multiple employees.",
          nextScene: 4,
          path: 'compromised'
        }
      ]
    },
    2: {
      id: 2,
      title: "A Costly Hesitation",
      description: "Your hesitation had consequences. By the time you acted, the fraudster had already moved money and compromised two more accounts. Now at 11:00 AM, Finance calls with urgent news: they've discovered something during their investigation of the breach. For the past 6 months, small discrepancies have appeared in payments to 'Premier Electric Supplies Ltd' - a recurring vendor. The invoices show amounts between ₦185,000-₦245,000, always just under the ₦250,000 threshold that requires additional approval. What's suspicious: all invoices are from the same vendor, the contact person shares a surname with a former employee who left 8 months ago, and payment records show subtle differences from the original purchase orders. Finance is already stressed from the earlier breach. This could be related. How do you proceed?",
      image: "⚠️",
      choices: [
        {
          text: "Escalate immediately - this could be connected to the morning's attack. Rally Finance, HR, Legal, and PPR for a full investigation",
          points: 30,
          feedback: "Sharp thinking! Your instinct was right - the same fraud ring was behind both attacks. Connecting the dots saved EKEDC millions.",
          nextScene: 5,
          path: 'redemption'
        },
        {
          text: "Request all documentation and launch a thorough audit of the vendor with Finance and PPR",
          points: 25,
          feedback: "Methodical approach. The audit reveals it's definitely fraud, but the investigation takes 3 days. Time matters in fraud cases.",
          nextScene: 5,
          path: 'vigilant'
        },
        {
          text: "Have Finance request meeting with the vendor to clarify the discrepancies",
          points: 5,
          feedback: "The vendor contact disappears immediately after your meeting request. Never tip off suspected fraudsters!",
          nextScene: 6,
          path: 'compromised'
        },
        {
          text: "Focus only on the high-value accounts from this morning - this vendor issue seems separate and smaller",
          points: -15,
          feedback: "Critical mistake! The vendor fraud was part of the same operation. Treating them separately let the fraudsters cover their tracks.",
          nextScene: 6,
          path: 'compromised'
        }
      ]
    },
    3: {
      id: 3,
      title: "A Pattern Emerges",
      description: "Your decisive action this morning has positioned you as a fraud prevention leader at EKEDC. It's now 2:00 PM, and HSE approaches with concerning information that connects to today's events. During routine wellness check-ins, they noticed behavioral changes in three employees across different departments over the past month: unusual stress, working very late hours, and seeming distracted. Today, IT's forensic analysis of the phishing attack reveals that these same three employees' credentials were compromised. Even more alarming: their database access logs show they've been querying customer financial data, account details, and billing information outside normal work hours for the past two weeks. One is from Finance, one from IT, and one from Commercial. HSE believes they may be victims of coercion - possibly threatened by the fraud ring. How do you handle this delicate situation?",
      image: "🔍",
      choices: [
        {
          text: "Convene immediate crisis team with HR, HSE, Legal, and IT - suspend access while offering employee support and protection resources",
          points: 45,
          feedback: "Exemplary leadership! Your balanced approach secured the data while helping the coerced employees. All three were victims of extortion and testified against the fraud ring.",
          nextScene: 7,
          path: 'hero'
        },
        {
          text: "Coordinate with IT to suspend access, then work with HR and HSE to understand each situation before taking further action",
          points: 35,
          feedback: "Solid crisis management. Security first, but with compassion. Two employees were indeed being extorted and provided crucial evidence.",
          nextScene: 7,
          path: 'vigilant'
        },
        {
          text: "Immediately report to Legal and recommend termination - we can't risk further data breaches",
          points: 10,
          feedback: "Too harsh. Investigation revealed all three were being blackmailed. Terminating them lost valuable witnesses and damaged EKEDC's reputation.",
          nextScene: 8,
          path: 'delayed'
        },
        {
          text: "Confront the employees directly to get their side of the story",
          points: -10,
          feedback: "Dangerous move! One panicked and deleted evidence. The fraud ring's leaders escaped. Never confront suspected compromised individuals without security measures.",
          nextScene: 8,
          path: 'compromised'
        }
      ]
    },
    4: {
      id: 4,
      title: "Damage Control Mode",
      description: "The morning's slow response has cost EKEDC - 23 employee credentials were compromised. It's now 3:00 PM and you're in damage control. During the emergency meeting, EFR drops a bombshell: they've been investigating a separate issue that might be connected. Over the past two months, Technical Services has flagged unusual patterns at 8 commercial locations - all show signs of sophisticated meter tampering, but something's different this time. The tampered meters were replaced with legitimate-looking 'upgraded' devices that are actually bypass systems. Field teams discovered business cards at several locations advertising 'Energy Cost Optimization Services by PowerSmart Solutions.' When Commercial checked, they found this company has been cold-calling EKEDC customers, offering to 'reduce electricity costs by up to 60%' through 'technical optimization.' Several customers have already signed up. This could be a large-scale organized operation. Given today's multiple security failures, how do you respond?",
      image: "⚡",
      choices: [
        {
          text: "This is bigger than we thought - coordinate massive response with EFR, Commercial, Technical Services, Legal, and law enforcement immediately",
          points: 40,
          feedback: "You turned the day around! Your comprehensive response dismantled the entire fraud operation. Law enforcement arrested 12 people. Redemption achieved!",
          nextScene: 9,
          path: 'redemption'
        },
        {
          text: "Work with EFR and Technical Services to identify all affected sites and document everything for Legal action",
          points: 30,
          feedback: "Good recovery strategy. Evidence gathering takes 5 days, but your thoroughness leads to successful prosecution.",
          nextScene: 9,
          path: 'vigilant'
        },
        {
          text: "Focus on recovering losses from the customers who used this service",
          points: 15,
          feedback: "Too narrow. While you recovered some funds, the fraud operation continued targeting more customers. Think bigger!",
          nextScene: 10,
          path: 'delayed'
        },
        {
          text: "Issue warnings to customers and let EFR monitor for new cases",
          points: 10,
          feedback: "Reactive approach. The operation grew larger. Passive monitoring isn't enough when facing organized criminal activity.",
          nextScene: 10,
          path: 'compromised'
        }
      ]
    },
    5: {
      id: 5,
      title: "The Conspiracy Unfolds",
      description: "Your investigation has revealed something major - this morning's cyberattacks, the vendor fraud, and employee coercion are all connected. It's 4:00 PM and Legal has called an emergency executive meeting. The former employee listed on the vendor invoices was fired 8 months ago for 'performance issues' but now you've discovered they were actually caught trying to access restricted customer data. They were escorted out before a full investigation was completed. Now they're running a sophisticated fraud ring targeting EKEDC from multiple angles. The big question: Are there more compromised employees still inside EKEDC? Corp Comms is ready to make a public statement, but Legal is concerned about tipping off remaining accomplices. HSE has identified 5 more employees showing stress indicators. IT has found suspicious access patterns from 7 employee accounts. The executives are looking to your department to recommend the next move. What's your strategy?",
      image: "🕵️",
      choices: [
        {
          text: "Launch Operation Clean House - covert investigation by trusted team from Legal, IT, HSE, and HR while continuing normal operations",
          points: 50,
          feedback: "Masterful strategy! Your covert operation identified 4 more compromised employees and led to the arrest of the entire fraud ring, including the former employee mastermind. EKEDC is secure!",
          nextScene: 11,
          path: 'hero'
        },
        {
          text: "Implement enhanced monitoring on all flagged accounts while HR and HSE carefully interview potentially compromised employees",
          points: 40,
          feedback: "Balanced and effective. The investigation takes 2 weeks but successfully identifies all bad actors without causing panic. Well managed!",
          nextScene: 11,
          path: 'vigilant'
        },
        {
          text: "Recommend company-wide system lockdown and mandatory security training for all employees before proceeding",
          points: 20,
          feedback: "Safety-first approach, but the lockdown tipped off the remaining accomplices. Two destroyed evidence, one fled. Sometimes subtlety wins.",
          nextScene: 11,
          path: 'delayed'
        },
        {
          text: "Go public immediately with Corp Comms statement to warn customers and employees about the fraud ring",
          points: 10,
          feedback: "Transparency is good, but timing matters. The public statement panicked the market, damaged EKEDC's reputation, and the fraudsters went underground.",
          nextScene: 11,
          path: 'compromised'
        }
      ]
    },
    6: {
      id: 6,
      title: "The Fraud Ring Strikes",
      description: "Earlier mistakes have consequences. It's 4:30 PM and the situation is spiraling. The vendor fraud you delayed investigating? They just attempted to process a ₦15 million 'emergency infrastructure payment' using forged approvals. Finance caught it only by luck when someone noticed the approval signature didn't match. Now Commercial reports that 'PowerSmart Solutions' - the company offering meter tampering services - has expanded operations. They've compromised 23 customer sites in the past week alone. EFR estimates losses at ₦45 million. Worse: Anonymous whistleblower tips are flooding in claiming there are EKEDC employees helping from the inside. Corp Comms is getting press inquiries about 'security issues at EKEDC.' Social media is lighting up with customer complaints. The executives are in crisis mode and need your department to help salvage this situation. Can you still turn this around?",
      image: "🔥",
      choices: [
        {
          text: "Request emergency powers - assemble crisis team from all departments, bring in external security consultants, and coordinate with law enforcement",
          points: 45,
          feedback: "Crisis leadership at its finest! Your emergency response contained the situation. External experts helped identify systemic weaknesses. It's not perfect, but you saved EKEDC from catastrophic loss!",
          nextScene: 11,
          path: 'redemption'
        },
        {
          text: "Focus resources on the ₦15 million attempted theft and the compromised meters - work with Legal to prosecute",
          points: 30,
          feedback: "You're addressing symptoms, not causes. These threats are neutralized but the underlying fraud ring remains intact, planning their next attack.",
          nextScene: 11,
          path: 'delayed'
        },
        {
          text: "Coordinate damage control with Corp Comms while IT and EFR handle their respective issues",
          points: 20,
          feedback: "Fragmented response to a coordinated attack. Each department works in isolation. Some issues get resolved, others worsen. Fraud prevention requires unity!",
          nextScene: 11,
          path: 'compromised'
        },
        {
          text: "Recommend hiring external investigators to review everything while normal operations continue",
          points: 15,
          feedback: "External help arrives too late. While investigators review historical data, the fraud ring makes three more successful attacks. Speed matters!",
          nextScene: 11,
          path: 'compromised'
        }
      ]
    },
    7: {
      id: 7,
      title: "Breaking the Ring",
      description: "Your handling of the compromised employees was perfect - they're now cooperating fully. It's 5:30 PM and their testimony has provided the breakthrough needed. The mastermind behind everything is the former employee, but he's not working alone. He partnered with organized criminals running fraud operations across multiple utility companies. Their method: infiltrate companies using social engineering, compromise employees through coercion, install accomplices in vendor relationships, and deploy technical teams to tamper with infrastructure. They've hit 6 other power companies in Nigeria. EKEDC was supposed to be their biggest score yet. Legal has enough evidence to prosecute, but there's a bigger decision: The fraud ring doesn't know you've identified all their accomplices. You could arrest them now and stop EKEDC's losses immediately. Or you could run a sting operation with law enforcement to catch the entire network, including their operations at other companies. It's risky - they might detect it and flee. But it could shut down the whole operation permanently. What's your recommendation?",
      image: "⚖️",
      choices: [
        {
          text: "Coordinate with law enforcement for a simultaneous multi-company sting operation - let's end this fraud ring permanently",
          points: 55,
          feedback: "LEGENDARY! Your sting operation led to arrests across 4 states. 47 people arrested, ₦890 million in fraud prevented across the entire power sector. You're a national fraud prevention hero!",
          nextScene: 11,
          path: 'hero'
        },
        {
          text: "Work with law enforcement on EKEDC sting while alerting other utility companies to investigate their operations",
          points: 45,
          feedback: "Excellent collaborative approach! EKEDC operation is successful, and your intelligence helps other companies. The fraud ring is dismantled. Outstanding work!",
          nextScene: 11,
          path: 'hero'
        },
        {
          text: "Arrest the known accomplices immediately and let law enforcement handle the broader network investigation",
          points: 30,
          feedback: "Safe choice. EKEDC is secured and losses stop immediately. However, the masterminds escape and set up operations elsewhere. Sometimes you need to take calculated risks.",
          nextScene: 11,
          path: 'vigilant'
        },
        {
          text: "Secure EKEDC first with immediate arrests, then provide evidence to authorities for broader investigation",
          points: 35,
          feedback: "EKEDC-first approach works. Your arrests make news, warning off the broader network. They disperse before law enforcement can act, but EKEDC is safe.",
          nextScene: 11,
          path: 'vigilant'
        }
      ]
    },
    8: {
      id: 8,
      title: "Picking Up the Pieces",
      description: "Today's been rough. Your earlier decisions have had mixed results - some threats neutralized, others still active. It's now 6:00 PM and you're in a strategy meeting with department heads trying to prevent further losses. During the meeting, something unexpected happens: the anonymous whistleblower who's been sending tips about insider involvement calls the fraud hotline and asks specifically for you by name. They say they'll only speak to your department. Security patches them through. The voice is disguised, but they provide specific information: 'The vendor fraud, the phishing attack, the meter tampering - they're all connected. The person coordinating it from inside EKEDC is in a position of trust. They're planning something big this Friday - a data breach and simultaneous financial theft. I know because they tried to recruit me last month. I can provide evidence, but I need protection. I won't give my name until I know I'm safe.' The room goes silent. Everyone's looking at you. How do you handle this critical moment?",
      image: "📞",
      choices: [
        {
          text: "Immediately establish whistleblower protection protocol with Legal and HR, guarantee anonymity, and create secure channel for evidence transfer",
          points: 50,
          feedback: "Perfect response! Your protection measures work. The whistleblower provides evidence that stops Friday's attack and reveals the inside coordinator. You've redeemed today's earlier mistakes!",
          nextScene: 11,
          path: 'redemption'
        },
        {
          text: "Work with Legal to offer formal whistleblower protection while IT sets up secure evidence submission process",
          points: 40,
          feedback: "Good procedural approach. The whistleblower eventually trusts the process and comes forward. Friday's attack is prevented, though barely. You got there in the end!",
          nextScene: 11,
          path: 'vigilant'
        },
        {
          text: "Try to convince the whistleblower to reveal their identity now, promising protection afterward",
          points: 15,
          feedback: "Trust is earned, not demanded. The whistleblower hangs up. Without their evidence, Friday's attack succeeds partially. Always protect sources first!",
          nextScene: 11,
          path: 'compromised'
        },
        {
          text: "Have IT trace the call while keeping them talking to identify the whistleblower",
          points: -20,
          feedback: "Huge mistake! The whistleblower realizes what you're doing and disappears. Your betrayal costs EKEDC millions on Friday. Whistleblowers must be protected, not hunted!",
          nextScene: 11,
          path: 'compromised'
        }
      ]
    },
    9: {
      id: 9,
      title: "Operation PowerGuard",
      description: "Your decisive action on the meter tampering operation has impressed everyone. It's 6:00 PM and law enforcement has joined the emergency response team. They reveal that PowerSmart Solutions is under investigation in three other states for similar operations, but they've never been able to catch them in the act. You have something they don't: active fraud in progress, evidence on the ground, and the element of surprise. The Commercial team has identified that the fraud ring is scheduling 'installations' at 12 more EKEDC customer sites over the next 48 hours. Law enforcement proposes an ambitious plan: let the installations proceed under surveillance, catch the technicians in the act, then use them to roll up the entire organization. It means allowing fraud to happen in the short term to stop it permanently. EFR is concerned about the losses. Commercial worries about customer safety. Legal sees the prosecution value. Technical Services can provide covert monitoring. This is your call - you've led the fraud response all day. What's your decision?",
      image: "🎯",
      choices: [
        {
          text: "Green-light the operation - coordinate surveillance with EFR, Technical Services, and law enforcement. Let's catch them all.",
          points: 55,
          feedback: "SPECTACULAR! Operation PowerGuard succeeds flawlessly. All 12 'technicians' arrested, their warehouse raided, masterminds captured. Your bold decision saved the entire power sector from this fraud ring!",
          nextScene: 11,
          path: 'hero'
        },
        {
          text: "Modified approach - allow 3-4 installations under surveillance to gather evidence, then shut down the rest immediately",
          points: 45,
          feedback: "Smart balanced strategy! You get enough evidence for prosecution while limiting customer exposure. The fraud ring's operations are permanently shut down. Excellent judgment!",
          nextScene: 11,
          path: 'vigilant'
        },
        {
          text: "Stop all scheduled installations immediately, secure current evidence, and let law enforcement build their case from what we have",
          points: 30,
          feedback: "Conservative but reasonable. The technicians you catch provide some intelligence, but the masterminds escape. The operation moves to another state. EKEDC is safe though.",
          nextScene: 11,
          path: 'vigilant'
        },
        {
          text: "This is too risky - focus on protecting EKEDC customers and recovering losses. Law enforcement can handle the bigger investigation separately",
          points: 20,
          feedback: "Risk-averse choice. EKEDC's immediate threat is contained, but the fraud ring continues operating elsewhere. Sometimes you need to think beyond just your company.",
          nextScene: 11,
          path: 'delayed'
        }
      ]
    },
    10: {
      id: 10,
      title: "The Final Test",
      description: "It's 7:00 PM. What started as a normal Monday turned into a masterclass in fraud prevention - or a cautionary tale, depending on the choices you made. The day's events are winding down, but there's one last critical decision. IT's forensic analysis has identified the source of this morning's coordinated attack: a sophisticated phishing campaign targeted specifically at EKEDC employees started 3 months ago. The attackers spent months gathering intelligence about company operations, internal systems, and key personnel. They studied EKEDC's fraud prevention protocols and specifically designed attacks to exploit gaps. The most concerning discovery: They accessed an internal document from 8 months ago titled 'Security Vulnerabilities Assessment' that outlined weaknesses in EKEDC's fraud prevention systems. That document was never supposed to leave the company. Only 12 people had access to it. One of them is in this room right now. Corp Comms wants to release a statement about today's events. Legal wants to keep everything confidential during investigation. The executives are divided. Given everything that's happened today, how do you recommend EKEDC move forward?",
      image: "🌙",
      choices: [
        {
          text: "Full transparency - release comprehensive statement about the attacks, what was learned, and how EKEDC is strengthening security. Show the power sector how to defend against these threats",
          points: 45,
          feedback: "Courageous leadership! Your transparency turns EKEDC's trial by fire into an industry-wide teaching moment. Other companies strengthen their defenses using your lessons. True fraud prevention is sharing knowledge!",
          nextScene: 11,
          path: 'hero'
        },
        {
          text: "Balanced approach - acknowledge the incident publicly while keeping investigative details confidential. Focus on what customers and employees need to know",
          points: 40,
          feedback: "Wise balance of transparency and security. Your statement maintains trust while protecting the ongoing investigation. Professional crisis communication!",
          nextScene: 11,
          path: 'vigilant'
        },
        {
          text: "Keep it confidential for now - complete the investigation, strengthen security, then share lessons learned after everything is resolved",
          points: 25,
          feedback: "Cautious approach. Investigation proceeds smoothly, but rumors and speculation damage EKEDC's reputation in the interim. Sometimes transparency prevents worse speculation.",
          nextScene: 11,
          path: 'delayed'
        },
        {
          text: "Minimal disclosure - release basic statement that security incident occurred and was contained. Keep all details internal",
          points: 15,
          feedback: "Too secretive. The lack of information creates customer anxiety and media speculation. EKEDC appears to be hiding something worse. Secrecy often backfires in crisis situations.",
          nextScene: 11,
          path: 'compromised'
        }
      ]
    },
    11: {
      id: 11,
      title: "The Day's End - Your Legacy at EKEDC",
      description: "It's 8:00 PM. The sun has set on an extraordinary day at EKEDC. What began as a routine Monday morning transformed into a comprehensive battle against a sophisticated fraud operation. As you reflect on the day's events, one thing is crystal clear: Fraud prevention truly is a team effort, and today proved that those who refuse to sit on the sidelines can make all the difference. Your decisions throughout the day didn't just impact EKEDC - they influenced the entire Nigerian power sector's approach to fraud prevention. The question now is: What kind of impact did you make?",
      image: "🏆",
      choices: []
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && !startTime) {
      setStartTime(Date.now());
    }
  }, [gameState, startTime]);

  const handleStartGame = () => {
    const filledMembers = teamMembers.filter(m => m.trim() !== '');
    if (teamName && department && filledMembers.length >= 2) {
      setGameState('playing');
      setCurrentScene(0);
      setPoints(0);
      setDecisions([]);
      setStartTime(Date.now());
      setStoryPath('main');
    }
  };

  const updateTeamMember = (index, value) => {
    const newMembers = [...teamMembers];
    newMembers[index] = value;
    setTeamMembers(newMembers);
  };

  const saveGameResults = async () => {
    try {
      setSaveStatus('saving');
      const gameResults = {
        teamName,
        department,
        teamMembers: teamMembers.filter(m => m.trim() !== ''),
        points,
        completionTime: teamSpeed,
        rating: getPerformanceRating().rating,
        decisions: decisions.length,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
      };

      const resultKey = `game:${Date.now()}:${teamName.replace(/\s/g, '-')}`;
      await window.storage.set(resultKey, JSON.stringify(gameResults), true);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving results:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleChoice = (choice) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    setPoints(prev => prev + choice.points);
    setDecisions(prev => [...prev, {
      scene: currentScene,
      choice: choice.text,
      points: choice.points,
      feedback: choice.feedback,
      path: choice.path
    }]);

    if (choice.path) {
      setStoryPath(choice.path);
    }

    if (choice.nextScene <= 10) {
      setTimeout(() => {
        setCurrentScene(choice.nextScene);
      }, 3000);
    } else {
      setTeamSpeed(timeTaken);
      setTimeout(() => {
        setGameState('complete');
      }, 3000);
    }
  };

  const handlePlayAgain = () => {
    setGameState('setup');
    setTeamName('');
    setDepartment('');
    setTeamMembers(['', '', '', '']);
    setCurrentScene(0);
    setPoints(0);
    setTeamSpeed(0);
    setDecisions([]);
    setStartTime(null);
    setStoryPath('main');
    setSaveStatus('');
  };

  const viewLeaderboard = () => {
    setGameState('leaderboard');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = () => {
    if (points >= 150) return { 
      rating: "Fraud Prevention Legend", 
      color: "text-yellow-400", 
      stars: 5,
      description: "Your decisions today saved EKEDC and set a new standard for fraud prevention in the power sector. Your name will be remembered as a champion who never sat on the sidelines."
    };
    if (points >= 100) return { 
      rating: "Vigilant Guardian", 
      color: "text-green-400", 
      stars: 4,
      description: "Your proactive approach and collaborative spirit prevented major losses. EKEDC is more secure because you refused to sit on the sidelines."
    };
    if (points >= 50) return { 
      rating: "Aware Defender", 
      color: "text-blue-400", 
      stars: 3,
      description: "You showed solid fraud awareness and learned valuable lessons. While there were challenges, you demonstrated that fraud prevention is indeed a team effort."
    };
    if (points >= 20) return { 
      rating: "Learning Responder", 
      color: "text-purple-400", 
      stars: 2,
      description: "The day was difficult with several setbacks, but you gained important experience. Remember: quick, coordinated action is essential in fraud prevention."
    };
    return { 
      rating: "Needs Development", 
      color: "text-red-400", 
      stars: 1,
      description: "Today's events highlighted critical gaps in fraud response. The good news? Every mistake is a learning opportunity. Never sit on the sidelines again."
    };
  };

  if (gameState === 'leaderboard') {
    return <LeaderboardView onBack={() => setGameState('setup')} />;
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="https://ekedp.com/front/assets/images/resources/logo-1.png" 
                alt="EKEDC Logo" 
                className="h-20"
              />
              <div>
                <h1 className="text-4xl font-bold text-gray-800">EKEDC Fraud Prevention Adventure</h1>
                <p className="text-gray-600 mt-2">International Fraud Awareness Week Challenge</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Mission Brief</h3>
                  <p className="text-gray-700 mb-3">
                    It's Monday morning at EKEDC, and what seems like a routine day is about to become anything but ordinary. Your department will face a series of interconnected fraud attempts that will test your decision-making, collaboration skills, and fraud prevention expertise. Every choice you make will shape the story and determine the outcome.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Theme: "Fraud Prevention is a Team Effort - Don't Sit on the Sidelines"
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Team Members (minimum 2 required)</label>
                <div className="space-y-3">
                  {teamMembers.map((member, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={member}
                      onChange={(e) => updateTeamMember(idx, e.target.value)}
                      placeholder={`Team member ${idx + 1}${idx < 2 ? ' (required)' : ' (optional)'}`}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                How This Adventure Works
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Experience an unfolding story where your choices matter</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Make strategic decisions that branch the narrative</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Earn points based on fraud prevention effectiveness</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Collaborate across departments to stop a sophisticated fraud ring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Complete the mission quickly, but don't sacrifice quality for speed</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartGame}
              disabled={!teamName || !department || teamMembers.filter(m => m.trim() !== '').length < 2}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center"
            >
              <Users className="w-6 h-6 mr-2" />
              Begin Your Mission
            </button>

            <button
              onClick={viewLeaderboard}
              className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors flex items-center justify-center"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const scenario = gameScenarios[currentScene];
    const lastDecision = decisions[decisions.length - 1];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{teamName}</h2>
                <p className="text-gray-600">{department}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center text-blue-600">
                    <Star className="w-5 h-5 mr-1" />
                    <span className="text-2xl font-bold">{points}</span>
                  </div>
                  <p className="text-xs text-gray-600">Points</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="text-2xl font-bold">
                      {formatTime(Math.floor((Date.now() - startTime) / 1000))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Time</p>
                </div>
              </div>
            </div>
          </div>

          {lastDecision && (
            <div className={`mb-6 p-4 rounded-lg ${lastDecision.points > 0 ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'}`}>
              <p className="font-semibold text-gray-800 mb-1">
                {lastDecision.points > 0 ? '✓' : '✗'} {lastDecision.points > 0 ? 'Strong Decision!' : 'Challenging Outcome'}
                <span className="ml-2 text-sm">({lastDecision.points > 0 ? '+' : ''}{lastDecision.points} points)</span>
              </p>
              <p className="text-gray-700 text-sm">{lastDecision.feedback}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <div className="text-6xl mb-4 text-center">{scenario.image}</div>
              <div className="text-sm text-gray-500 mb-2 text-center">Chapter {scenario.id + 1}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">{scenario.title}</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{scenario.description}</p>
              </div>
            </div>

            {scenario.choices.length > 0 ? (
              <div className="space-y-4 mt-8">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">What will {teamName} do?</h3>
                {scenario.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left p-5 bg-gray-50 hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-500 rounded-lg transition-all transform hover:scale-102 hover:shadow-lg"
                  >
                    <span className="text-gray-800 leading-relaxed">{choice.text}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    const performance = getPerformanceRating();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Mission Complete!</h1>
              <p className="text-xl text-gray-600 mb-2">{teamName}</p>
              <p className="text-lg text-gray-500 mb-1">{department}</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {teamMembers.filter(m => m.trim() !== '').map((member, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {member}
                  </span>
                ))}
              </div>
              <div className={`text-3xl font-bold ${performance.color} mb-2`}>
                {performance.rating}
              </div>
              <div className="flex justify-center mb-4">
                {[...Array(performance.stars)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-current mx-1" />
                ))}
              </div>
              <p className="text-gray-600 italic max-w-2xl mx-auto">{performance.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <Star className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-gray-800">{points}</div>
                <div className="text-gray-600">Total Points</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-gray-800">{formatTime(teamSpeed)}</div>
                <div className="text-gray-600">Completion Time</div>
              </div>
            </div>

            {saveStatus && (
              <div className={`mb-6 p-4 rounded-lg text-center ${
                saveStatus === 'saved' ? 'bg-green-100 text-green-800' : 
                saveStatus === 'saving' ? 'bg-blue-100 text-blue-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {saveStatus === 'saved' && '✓ Score saved to leaderboard!'}
                {saveStatus === 'saving' && '⏳ Saving score...'}
                {saveStatus === 'error' && '✗ Error saving score. Please try again.'}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-4 text-xl">Your Story Journey</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {decisions.map((decision, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded-r">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800">Chapter {decision.scene + 1}</span>
                      <span className={`font-bold ${decision.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {decision.points > 0 ? '+' : ''}{decision.points} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{decision.choice}</p>
                    <p className="text-sm text-gray-500 italic">{decision.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 mb-6">
              <h3 className="font-bold text-2xl mb-3">Remember:</h3>
              <p className="text-xl mb-4">
                "Fraud Prevention is a Team Effort - Don't Sit on the Sidelines"
              </p>
              <p className="text-blue-100 leading-relaxed">
                Today's adventure showed that protecting EKEDC from fraud requires vigilance, collaboration, and decisive action from every department. Whether you prevented a catastrophe or learned valuable lessons, remember that every team member plays a crucial role in our security. Stay alert, communicate across departments, and never hesitate to report suspicious activities!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={saveGameResults}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 mr-2" />
                {saveStatus === 'saved' ? 'Score Saved!' : 'Save to Leaderboard'}
              </button>

              <button
                onClick={viewLeaderboard}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 mr-2" />
                View Leaderboard
              </button>
            </div>

            <button
              onClick={handlePlayAgain}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center"
            >
              <Users className="w-6 h-6 mr-2" />
              Start New Adventure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FraudAwarenessGame;