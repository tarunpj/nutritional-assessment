import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '', password: '', firstName: '', lastName: ''
  });
  const [showRegister, setShowRegister] = useState(false);
  const [todayLog, setTodayLog] = useState(null);
  const [foodQuery, setFoodQuery] = useState('');
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [progressData, setProgressData] = useState({ waterIntake: '', exerciseDuration: '', status: 'pending' });
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileData, setProfileData] = useState({ age: '', weight: '', height: '', gender: '', activityLevel: '', goal: '' });
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      const userData = response.data.user;
      setUser(userData);
      
      // Check if profile is incomplete
      if (!userData.age || !userData.weight || !userData.height || !userData.gender || !userData.activityLevel || !userData.goal) {
        setShowProfileSetup(true);
      } else {
        fetchTodayLog();
        fetchRecommendations();
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const fetchTodayLog = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nutrition/today');
      setTodayLog(response.data.log);
    } catch (error) {
      console.error('Failed to fetch today log');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recommendations');
      if (response.data.recommendations.length === 0) {
        await axios.post('http://localhost:5000/api/recommendations/generate');
        const newResponse = await axios.get('http://localhost:5000/api/recommendations');
        setRecommendations(newResponse.data.recommendations);
      } else {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      fetchTodayLog();
      fetchRecommendations();
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', registerData);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      fetchTodayLog();
      fetchRecommendations();
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTodayLog(null);
    setRecommendations([]);
    setChatMessages([]);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const searchFood = async () => {
    if (!foodQuery.trim()) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/nutrition/food-info/${encodeURIComponent(foodQuery)}`);
      setNutritionInfo(response.data);
    } catch (error) {
      setNutritionInfo({ error: 'Food not found. Try: apple, banana, chicken breast, rice, pizza, broccoli, salmon, bread' });
    }
  };

  const addQuickFood = async (food) => {
    try {
      await axios.post('http://localhost:5000/api/nutrition/food', food);
      fetchTodayLog();
      alert(`${food.foodName} added successfully!`);
    } catch (error) {
      alert('Failed to add food');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
        message: chatInput
      });
      
      const botMessage = { 
        role: 'bot', 
        content: response.data.message, 
        timestamp: new Date(response.data.timestamp) 
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'bot', 
        content: "Sorry, I'm having trouble right now. Please try again! 😊", 
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const startChat = () => {
    if (chatMessages.length === 0) {
      const welcomeMessage = {
        role: 'bot',
        content: `Hi ${user.firstName}! 👋 I'm NutriBot, your personal nutrition assistant. I can help you with diet advice, meal planning, and healthy lifestyle tips based on your profile. What would you like to know?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  };

  const updateProgress = async () => {
    try {
      await axios.put('http://localhost:5000/api/nutrition/daily-log', progressData);
      fetchTodayLog();
      setShowProgressUpdate(false);
      setProgressData({ waterIntake: '', exerciseDuration: '', status: 'pending' });
      alert('Progress updated successfully!');
    } catch (error) {
      alert('Failed to update progress');
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put('http://localhost:5000/api/auth/profile', profileData);
      setShowProfileSetup(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', border: '1px solid #e9ecef' }}>
          <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '28px' }}>🥗 Diet Assessment Tool</h1>
          
          {!showRegister ? (
            <div>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Welcome Back!</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="📧 Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  style={{ width: '100%', padding: '15px', margin: '10px 0', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '16px', background: '#f8f9fa', color: '#333' }}
                  required
                />
                <input
                  type="password"
                  placeholder="🔒 Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  style={{ width: '100%', padding: '15px', margin: '10px 0', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '16px', background: '#f8f9fa', color: '#333' }}
                  required
                />
                <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(45deg, #007bff, #0056b3)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', margin: '10px 0', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)' }}>
                  Sign In
                </button>
              </form>
              <p style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
                Don't have an account? 
                <button onClick={() => setShowRegister(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>
                  Register here
                </button>
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Create Account</h2>
              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" placeholder="First Name" value={registerData.firstName} onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})} style={{ padding: '12px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} required />
                  <input type="text" placeholder="Last Name" value={registerData.lastName} onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})} style={{ padding: '12px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} required />
                </div>
                <input type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} required />
                <input type="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} required />
                <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(45deg, #007bff, #0056b3)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', margin: '10px 0', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)' }}>
                  Create Account
                </button>
              </form>
              <p style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
                Already have an account? 
                <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const caloriePercentage = todayLog ? Math.min((todayLog.calories_consumed / user.dailyCalories) * 100, 100) : 0;
  const remaining = todayLog ? Math.max(user.dailyCalories - todayLog.calories_consumed, 0) : user.dailyCalories;

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxWidth: '500px', width: '90%' }}>
          <h2 style={{ textAlign: 'center', color: '#ffffff', marginBottom: '30px' }}>Complete Your Profile</h2>
          <p style={{ textAlign: 'center', color: '#b0b0b0', marginBottom: '30px' }}>Please provide your details to get personalized recommendations</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '10px 0' }}>
            <input type="number" placeholder="Age" value={profileData.age} onChange={(e) => setProfileData({...profileData, age: e.target.value})} style={{ padding: '12px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }} required />
            <input type="number" placeholder="Weight (kg)" value={profileData.weight} onChange={(e) => setProfileData({...profileData, weight: e.target.value})} style={{ padding: '12px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }} required />
            <input type="number" placeholder="Height (cm)" value={profileData.height} onChange={(e) => setProfileData({...profileData, height: e.target.value})} style={{ padding: '12px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }} required />
          </div>
          
          <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          
          <select value={profileData.activityLevel} onChange={(e) => setProfileData({...profileData, activityLevel: e.target.value})} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }} required>
            <option value="">Activity Level</option>
            <option value="sedentary">Sedentary (Office job)</option>
            <option value="lightly_active">Lightly Active (Light exercise)</option>
            <option value="moderately_active">Moderately Active (Regular exercise)</option>
            <option value="very_active">Very Active (Heavy exercise)</option>
            <option value="extremely_active">Extremely Active (Athlete)</option>
          </select>
          
          <select value={profileData.goal} onChange={(e) => setProfileData({...profileData, goal: e.target.value})} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }} required>
            <option value="">Select Goal</option>
            <option value="lose_weight">🔥 Lose Weight</option>
            <option value="maintain_weight">⚖️ Maintain Weight</option>
            <option value="gain_weight">💪 Gain Weight</option>
            <option value="build_muscle">🏋️ Build Muscle</option>
            <option value="improve_health">❤️ Improve Health</option>
            <option value="increase_energy">⚡ Increase Energy</option>
            <option value="better_sleep">😴 Better Sleep</option>
          </select>
          
          <button onClick={updateProfile} style={{ width: '100%', padding: '15px', background: 'linear-gradient(45deg, #00d4ff, #090979)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', margin: '20px 0', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)' }}>
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#ffffff', margin: 0 }}>🥗 Diet Assessment Tool</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#e0e0e0' }}>Welcome, {user.firstName}!</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                setProfileData({
                  age: user.age || '',
                  weight: user.weight || '',
                  height: user.height || '',
                  gender: user.gender || '',
                  activityLevel: user.activityLevel || '',
                  goal: user.goal || ''
                });
                setShowProfileEdit(true);
              }} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                Edit Profile
              </button>
              <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {['dashboard', 'nutrition', 'chatbot', 'recommendations'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'chatbot') startChat();
              }}
              style={{
                padding: '15px 30px',
                background: activeTab === tab ? '#667eea' : 'transparent',
                color: activeTab === tab ? 'white' : '#666',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: activeTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab === 'dashboard' && '📊'} {tab === 'nutrition' && '🍎'} {tab === 'chatbot' && '🤖'} {tab === 'recommendations' && '💡'} {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            {/* Main Dashboard */}
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{user.bmi}</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>BMI</div>
                  <div style={{ fontSize: '12px', color: user.bmi < 18.5 ? '#ff6b6b' : user.bmi > 25 ? '#ff9f43' : '#2ed573', marginTop: '5px' }}>
                    {user.bmi < 18.5 ? 'Underweight' : user.bmi > 25 ? 'Overweight' : 'Normal'}
                  </div>
                </div>
                <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2ed573' }}>{user.dailyCalories}</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>Daily Goal</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Calories</div>
                </div>
                <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9f43' }}>{todayLog?.calories_consumed || 0}</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>Consumed</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{remaining} remaining</div>
                </div>
              </div>

              {/* Calorie Progress */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>📈 Today's Progress</h3>
                  <button
                    onClick={() => setShowProgressUpdate(true)}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(45deg, #00d4ff, #090979)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Update Progress
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                    <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="75" cy="75" r="60" stroke="#e1e5e9" strokeWidth="12" fill="none" />
                      <circle 
                        cx="75" 
                        cy="75" 
                        r="60" 
                        stroke={caloriePercentage > 100 ? '#ff4757' : caloriePercentage > 80 ? '#2ed573' : '#ff9f43'}
                        strokeWidth="12" 
                        fill="none"
                        strokeDasharray={`${caloriePercentage * 3.77} 377`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{Math.round(caloriePercentage)}%</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Complete</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3742fa' }}>{todayLog?.protein || 0}g</div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Protein</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ed573' }}>{todayLog?.carbs || 0}g</div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Carbs</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9f43' }}>{todayLog?.fats || 0}g</div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Fats</div>
                      </div>
                    </div>
                    
                    {/* Additional Progress Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00bcd4' }}>{todayLog?.water_intake || 0}L</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>Water</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff5722' }}>{todayLog?.exercise_duration || 0}min</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>Exercise</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: todayLog?.status === 'completed' ? '#4caf50' : '#ff9800' }}>
                          {todayLog?.status === 'completed' ? '✅' : '⏳'}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>{todayLog?.status === 'completed' ? 'Complete' : 'Pending'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Add Foods */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🍎 Quick Add Foods</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                  {[
                    { foodName: 'Apple', quantity: 1, unit: 'medium', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, emoji: '🍎' },
                    { foodName: 'Banana', quantity: 1, unit: 'medium', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, emoji: '🍌' },
                    { foodName: 'Chicken Breast', quantity: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fats: 3.6, emoji: '🍗' },
                    { foodName: 'Rice', quantity: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, emoji: '🍚' }
                  ].map((food, index) => (
                    <button
                      key={index}
                      onClick={() => addQuickFood(food)}
                      style={{
                        padding: '15px',
                        background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
                        border: '2px solid #e1e5e9',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{food.emoji}</div>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{food.foodName}</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>{food.calories} cal</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Update Modal */}
              {showProgressUpdate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '90%' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Update Today's Progress</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>Water Intake (liters)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        value={progressData.waterIntake}
                        onChange={(e) => setProgressData({...progressData, waterIntake: e.target.value})}
                        style={{ width: '100%', padding: '10px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>Exercise Duration (minutes)</label>
                      <input
                        type="number"
                        placeholder="e.g., 30"
                        value={progressData.exerciseDuration}
                        onChange={(e) => setProgressData({...progressData, exerciseDuration: e.target.value})}
                        style={{ width: '100%', padding: '10px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>Day Status</label>
                      <select
                        value={progressData.status}
                        onChange={(e) => setProgressData({...progressData, status: e.target.value})}
                        style={{ width: '100%', padding: '10px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={updateProgress}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'linear-gradient(45deg, #00d4ff, #090979)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setShowProgressUpdate(false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#ccc',
                          color: '#666',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Edit Modal */}
              {showProfileEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '90%' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Edit Profile</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '10px 0' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '12px' }}>Age</label>
                        <input type="number" placeholder="Age" value={profileData.age} onChange={(e) => setProfileData({...profileData, age: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '12px' }}>Weight (kg)</label>
                        <input type="number" placeholder="Weight" value={profileData.weight} onChange={(e) => setProfileData({...profileData, weight: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '12px' }}>Height (cm)</label>
                        <input type="number" placeholder="Height" value={profileData.height} onChange={(e) => setProfileData({...profileData, height: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }} />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '12px' }}>Gender</label>
                      <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '12px' }}>Activity Level</label>
                      <select value={profileData.activityLevel} onChange={(e) => setProfileData({...profileData, activityLevel: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }}>
                        <option value="">Activity Level</option>
                        <option value="sedentary">Sedentary (Office job)</option>
                        <option value="lightly_active">Lightly Active (Light exercise)</option>
                        <option value="moderately_active">Moderately Active (Regular exercise)</option>
                        <option value="very_active">Very Active (Heavy exercise)</option>
                        <option value="extremely_active">Extremely Active (Athlete)</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '12px' }}>Goal</label>
                      <select value={profileData.goal} onChange={(e) => setProfileData({...profileData, goal: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa', color: '#333' }}>
                        <option value="">Select Goal</option>
                        <option value="lose_weight">🔥 Lose Weight</option>
                        <option value="maintain_weight">⚖️ Maintain Weight</option>
                        <option value="gain_weight">💪 Gain Weight</option>
                        <option value="build_muscle">🏋️ Build Muscle</option>
                        <option value="improve_health">❤️ Improve Health</option>
                        <option value="increase_energy">⚡ Increase Energy</option>
                        <option value="better_sleep">😴 Better Sleep</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          updateProfile();
                          setShowProfileEdit(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'linear-gradient(45deg, #007bff, #0056b3)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Update Profile
                      </button>
                      <button
                        onClick={() => setShowProfileEdit(false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Health Tips */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>💡 Health Tips</h3>
                <div style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                  {user.bmi < 18.5 && "🔸 You're underweight. Focus on nutrient-dense, high-calorie foods like nuts, avocados, and lean proteins."}
                  {user.bmi >= 18.5 && user.bmi <= 25 && "🔸 Great! You're in the healthy weight range. Maintain your current lifestyle with balanced nutrition."}
                  {user.bmi > 25 && "🔸 Consider reducing caloric intake and increasing physical activity. Focus on vegetables, lean proteins, and whole grains."}
                </div>
              </div>

              {/* Goal Progress */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🎯 Your Goal</h3>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>
                    {user.goal === 'lose_weight' && '🔥 Lose Weight'}
                    {user.goal === 'maintain_weight' && '⚖️ Maintain Weight'}
                    {user.goal === 'gain_weight' && '💪 Gain Weight'}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                    {user.goal === 'lose_weight' && 'Stay in a caloric deficit. Aim for 500 calories below maintenance.'}
                    {user.goal === 'maintain_weight' && 'Keep your caloric intake balanced with your daily needs.'}
                    {user.goal === 'gain_weight' && 'Eat in a caloric surplus. Add 500 calories above maintenance.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>🍎 Nutrition Search</h2>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <input
                  type="text"
                  placeholder="Search for any food (e.g., 'apple', 'chicken breast', 'pizza')"
                  value={foodQuery}
                  onChange={(e) => setFoodQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchFood()}
                  style={{
                    flex: 1,
                    padding: '15px 20px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '25px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={searchFood}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Search
                </button>
              </div>

              {nutritionInfo && (
                <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '15px', marginBottom: '20px' }}>
                  {nutritionInfo.error ? (
                    <div style={{ color: '#ff4757', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>😕</div>
                      <div>{nutritionInfo.error}</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#333', textTransform: 'capitalize' }}>{nutritionInfo.foodName}</h3>
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: nutritionInfo.nutrition.rating === 'A' ? '#2ed573' : 
                                     nutritionInfo.nutrition.rating === 'B' ? '#3742fa' :
                                     nutritionInfo.nutrition.rating === 'C' ? '#ff9f43' : '#ff4757'
                        }}>
                          Grade {nutritionInfo.nutrition.rating}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '10px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4757' }}>{nutritionInfo.nutrition.calories}</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Calories</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '10px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3742fa' }}>{nutritionInfo.nutrition.protein}g</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Protein</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '10px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ed573' }}>{nutritionInfo.nutrition.carbs}g</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Carbs</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '10px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9f43' }}>{nutritionInfo.nutrition.fats}g</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Fats</div>
                        </div>
                      </div>
                      
                      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #2196f3' }}>
                        <div style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>💡 Health Tip:</div>
                        <div style={{ color: '#1565c0' }}>{nutritionInfo.healthTip}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                <div style={{ marginBottom: '10px' }}>Try searching for:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {['apple', 'banana', 'chicken breast', 'rice', 'pizza', 'broccoli', 'salmon', 'bread'].map(food => (
                    <button
                      key={food}
                      onClick={() => { setFoodQuery(food); searchFood(); }}
                      style={{
                        padding: '8px 15px',
                        background: '#f1f3f4',
                        border: '1px solid #dadce0',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', height: '600px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <h2 style={{ margin: 0, color: '#333' }}>🤖 NutriBot - Your AI Nutrition Assistant</h2>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Get personalized nutrition advice based on your profile</p>
              </div>
              
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {chatMessages.map((msg, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f1f3f4',
                      color: msg.role === 'user' ? 'white' : '#333',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {msg.role === 'bot' && <span style={{ marginRight: '8px' }}>🤖</span>}
                      {msg.content}
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '18px 18px 18px 4px',
                      background: '#f1f3f4',
                      color: '#333'
                    }}>
                      <span style={{ marginRight: '8px' }}>🤖</span>
                      <span>Thinking...</span>
                      <div style={{ display: 'inline-block', marginLeft: '8px' }}>
                        <div style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#667eea', animation: 'pulse 1.4s infinite', marginRight: '2px' }}></div>
                        <div style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#667eea', animation: 'pulse 1.4s infinite 0.2s', marginRight: '2px' }}></div>
                        <div style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#667eea', animation: 'pulse 1.4s infinite 0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Ask me about nutrition, diet plans, healthy recipes, or anything health-related..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !chatLoading && sendChatMessage()}
                    disabled={chatLoading}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '25px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    style={{
                      padding: '12px 20px',
                      background: chatLoading || !chatInput.trim() ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {chatLoading ? '⏳' : '🚀'}
                  </button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Try asking: "What should I eat for breakfast?", "How can I lose weight?", "Give me a meal plan"
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>💡 Personalized Recommendations</h2>
              
              {recommendations.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤔</div>
                  <div>Loading your personalized recommendations...</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '25px',
                        borderRadius: '15px',
                        border: '2px solid',
                        borderColor: rec.priority === 'high' ? '#ff4757' : rec.priority === 'medium' ? '#ff9f43' : '#2ed573',
                        background: rec.priority === 'high' ? '#fff5f5' : rec.priority === 'medium' ? '#fffbf0' : '#f0fff4'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>
                            {rec.type === 'nutrition' ? '🍎' : rec.type === 'exercise' ? '💪' : '💡'}
                          </span>
                          <h3 style={{ margin: 0, color: '#333' }}>{rec.title}</h3>
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: rec.priority === 'high' ? '#ff4757' : rec.priority === 'medium' ? '#ff9f43' : '#2ed573'
                        }}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>{rec.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;