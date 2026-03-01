import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Profile() {
  const navigate = useNavigate();
  const [email] = useState('user@example.com');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-primary-cream rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-primary-green" />
            </button>
            <h1 className="text-2xl font-bold text-primary-green">Profile</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Profile Info */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-primary-green text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-green">
                  {email.split('@')[0]}
                </h2>
                <p className="text-primary-green/60">{email}</p>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-primary-green mb-4">
              Travel Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Adventure', 'Food & Dining', 'Nature', 'Photography', 'Coffee Shops'].map(
                  (interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-primary-green/10 text-primary-green rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  )
                )}
              </div>
              <Button variant="outline" fullWidth>
                Edit Preferences
              </Button>
            </div>
          </Card>

          {/* Account Actions */}
          <div className="space-y-3">
            <Button
              fullWidth
              variant="outline"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
