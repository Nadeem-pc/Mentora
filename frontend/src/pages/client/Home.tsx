import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Users, ClipboardList, MessageCircle, Video, Clock, Heart } from 'lucide-react';

const MentalHealthPlatform = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };


  const upcomingSessions = [
    {
      id: 1,
      therapist: 'Dr. Sarah Johnson',
      specialty: 'Cognitive Behavioral Therapy',
      date: 'Today',
      time: '2:00 PM',
      type: 'Video Call',
    },
    {
      id: 2,
      therapist: 'Dr. Michael Chen',
      specialty: 'Mindfulness & Meditation',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'In-Person',
    },
  ];

  const notifications = [
    { id: 1, text: 'Your daily mindfulness reminder', time: '1h ago', unread: true },
    { id: 2, text: 'New message from Dr. Sarah Johnson', time: '3h ago', unread: true },
    { id: 3, text: 'Weekly progress report available', time: '1d ago', unread: false },
  ];

  const quickActions = [
    { icon: Calendar, label: 'Book Session', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: MessageCircle, label: 'Chat', color: 'bg-green-500 hover:bg-green-600' },
    { icon: Video, label: 'Join Call', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: ClipboardList, label: 'Assessments', color: 'bg-orange-500 hover:bg-orange-600' },
  ];

  const communityTopics = [
    { title: 'Managing Anxiety', members: 1234, active: true },
    { title: 'Sleep Better', members: 890, active: false },
    { title: 'Mindful Living', members: 2156, active: true },
  ];

  const assessments = [
    { name: 'Anxiety Scale (GAD-7)', status: 'Due', color: 'text-red-600' },
    { name: 'Depression Inventory', status: 'Completed', color: 'text-green-600' },
    { name: 'Stress Assessment', status: 'Available', color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br w-screen from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">MindCare</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                N
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, Nadeem 👋
          </h2>
          <p className="text-gray-600">Welcome back to your wellness journey</p>
        </div>

       

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white rounded-xl p-6 flex flex-col items-center justify-center space-y-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <action.icon className="w-8 h-8" />
              <span className="font-semibold text-sm">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h3>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{session.therapist}</h4>
                        <p className="text-sm text-gray-600">{session.specialty}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {session.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {session.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.time}
                      </div>
                    </div>
                    <button className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition">
                      Join Session
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Community</h3>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                {communityTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                        <p className="text-sm text-gray-600">{topic.members.toLocaleString()} members</p>
                      </div>
                      {topic.active && (
                        <span className="flex items-center text-green-600 text-sm">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                          Active now
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full border-2 border-purple-600 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition">
                Explore All Communities
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg ${
                      notif.unread ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                    } cursor-pointer hover:shadow-md transition`}
                  >
                    <p className="text-sm font-medium text-gray-900">{notif.text}</p>
                    <p className="text-xs text-gray-600 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-purple-600 text-sm font-medium hover:text-purple-700">
                View All Notifications
              </button>
            </div>

            {/* Assessments */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Assessments</h3>
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                {assessments.map((assessment, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">{assessment.name}</h4>
                    <p className={`text-xs font-semibold mt-1 ${assessment.color}`}>
                      {assessment.status}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition">
                Take Assessment
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default MentalHealthPlatform;