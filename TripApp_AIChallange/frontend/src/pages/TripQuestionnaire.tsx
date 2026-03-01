import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CategoryButton from '../components/ui/CategoryButton';

const ACTIVITY_CATEGORIES = [
  'Adventure',
  'Food & Dining',
  'Nature',
  'Art & Culture',
  'Photography',
  'Music',
  'Reading Spots',
  'Coffee Shops',
  'Water Activities',
  'Camping',
  'Hiking',
  'Local Gems',
  'Thrifting',
];

export default function TripQuestionnaire() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: 'location' | 'roadtrip' }>();
  const isRoadTrip = type === 'roadtrip';

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [activityIntensity, setActivityIntensity] = useState(3);
  const [soloOrGroup, setSoloOrGroup] = useState<'solo' | 'group'>('solo');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [includeGas, setIncludeGas] = useState(false);
  const [scenicRoute, setScenicRoute] = useState(false);

  const handleCategoryClick = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length < 5) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tripData = {
      type,
      destination: isRoadTrip ? 'Road Trip' : destination,
      duration: parseInt(duration),
      budget: parseFloat(budget),
      activity_intensity: activityIntensity,
      solo_or_group: soloOrGroup,
      categories: selectedCategories,
      ...(isRoadTrip && {
        include_gas: includeGas,
        scenic_route: scenicRoute,
      }),
    };

    // Store trip data temporarily
    sessionStorage.setItem('newTripData', JSON.stringify(tripData));

    // TODO: Call AI endpoint to generate itinerary
    // For now, navigate to a mock trip list view
    navigate('/trip/mock-id/list');
  };

  const intensityLabels = [
    'Very Relaxed',
    'Relaxed',
    'Moderate',
    'Packed',
    'Very Packed',
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/new-trip')}
              className="p-2 hover:bg-primary-cream rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-primary-green" />
            </button>
            <h1 className="text-2xl font-bold text-primary-green">
              {isRoadTrip ? 'Road Trip Details' : 'Trip Details'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          <p className="text-center text-primary-green/70 mb-8 italic">
            Not all who wander are lost, but some find better coffee.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination (only for location trips) */}
            {!isRoadTrip && (
              <Input
                label="Destination *"
                placeholder="Enter city or location"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            )}

            {/* Duration */}
            <Input
              label="How long is the trip? (days) *"
              type="number"
              min="1"
              placeholder="e.g., 5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />

            {/* Budget */}
            <Input
              label="What is your budget? (USD) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 1000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />

            {/* Road Trip Options */}
            {isRoadTrip && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-primary-green/20 rounded-lg cursor-pointer hover:border-primary-green/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeGas}
                    onChange={(e) => setIncludeGas(e.target.checked)}
                    className="w-5 h-5 text-primary-green rounded"
                  />
                  <span className="text-primary-green">Include gas costs</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-primary-green/20 rounded-lg cursor-pointer hover:border-primary-green/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={scenicRoute}
                    onChange={(e) => setScenicRoute(e.target.checked)}
                    className="w-5 h-5 text-primary-green rounded"
                  />
                  <span className="text-primary-green">Take the scenic route</span>
                </label>
              </div>
            )}

            {/* Activity Intensity */}
            <div>
              <label className="block text-sm font-medium text-primary-green mb-3">
                How jam-packed do you want the day to be? *
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={activityIntensity}
                  onChange={(e) => setActivityIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-primary-green/20 rounded-lg appearance-none cursor-pointer accent-primary-green"
                />
                <div className="flex justify-between text-xs text-primary-green/60">
                  {intensityLabels.map((label, index) => (
                    <span
                      key={label}
                      className={
                        activityIntensity === index + 1
                          ? 'font-medium text-primary-green'
                          : ''
                      }
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Solo or Group */}
            <div>
              <label className="block text-sm font-medium text-primary-green mb-3">
                Solo or Group? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSoloOrGroup('solo')}
                  className={`p-4 rounded-lg font-medium transition-all border-2 ${
                    soloOrGroup === 'solo'
                      ? 'bg-primary-green text-white border-primary-green'
                      : 'bg-white text-primary-green border-primary-green/20 hover:border-primary-green/50'
                  }`}
                >
                  Solo
                </button>
                <button
                  type="button"
                  onClick={() => setSoloOrGroup('group')}
                  className={`p-4 rounded-lg font-medium transition-all border-2 ${
                    soloOrGroup === 'group'
                      ? 'bg-primary-green text-white border-primary-green'
                      : 'bg-white text-primary-green border-primary-green/20 hover:border-primary-green/50'
                  }`}
                >
                  Group
                </button>
              </div>
            </div>

            {/* Optional Categories */}
            <div>
              <label className="block text-sm font-medium text-primary-green mb-3">
                Activity Categories (Optional - max 5)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ACTIVITY_CATEGORIES.map((category) => (
                  <CategoryButton
                    key={category}
                    label={category}
                    selected={selectedCategories.includes(category)}
                    onClick={() => handleCategoryClick(category)}
                    disabled={
                      !selectedCategories.includes(category) &&
                      selectedCategories.length >= 5
                    }
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" fullWidth>
              Generate Itinerary
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
