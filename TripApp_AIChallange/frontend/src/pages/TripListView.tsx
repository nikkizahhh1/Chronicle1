import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, MapPin, Trash2, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { DayItinerary } from '../types';

export default function TripListView() {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('San Francisco');
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    // TODO: Fetch itinerary from backend
    // Mock data for now
    const mockItinerary: DayItinerary[] = [
      {
        day: 1,
        date: '2024-03-15',
        activities: [
          {
            name: 'Golden Gate Bridge',
            type: 'Adventure',
            durationHours: 2,
            costUSD: 0,
            location: 'Golden Gate Bridge, San Francisco',
          },
          {
            name: 'Fisherman\'s Wharf',
            type: 'Food & Dining',
            durationHours: 3,
            costUSD: 40,
            location: 'Pier 39, San Francisco',
          },
          {
            name: 'Alcatraz Island Tour',
            type: 'Culture',
            durationHours: 3,
            costUSD: 45,
            location: 'Alcatraz Island',
          },
        ],
        totalCostUSD: 85,
        transportMode: 'walk',
      },
      {
        day: 2,
        date: '2024-03-16',
        activities: [
          {
            name: 'Golden Gate Park',
            type: 'Nature',
            durationHours: 2,
            costUSD: 0,
            location: 'Golden Gate Park, San Francisco',
          },
          {
            name: 'de Young Museum',
            type: 'Art & Culture',
            durationHours: 2,
            costUSD: 15,
            location: '50 Hagiwara Tea Garden Dr',
          },
        ],
        totalCostUSD: 15,
        transportMode: 'subway',
      },
    ];

    setTimeout(() => {
      setItinerary(mockItinerary);
      setTotalBudget(mockItinerary.reduce((sum, day) => sum + day.totalCostUSD, 0));
      setLoading(false);
    }, 500);
  }, [tripId]);

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newItinerary = [...itinerary];
    const removedCost = newItinerary[dayIndex].activities[activityIndex].costUSD;
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    newItinerary[dayIndex].totalCostUSD -= removedCost;
    setItinerary(newItinerary);
    setTotalBudget(totalBudget - removedCost);
  };

  const handleConfirm = () => {
    // TODO: Save trip to backend
    navigate(`/trip/${tripId}/map`);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-primary-cream rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-primary-green" />
              </button>
              <h1 className="text-2xl font-bold text-primary-green">{destination}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-primary-green/60">
              <span>{itinerary.length} days</span>
              <span>•</span>
              <span>${totalBudget.toFixed(2)} total</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-green/60">Generating your perfect itinerary...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Itinerary */}
              {itinerary.map((day, dayIndex) => (
                <div key={day.day}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-primary-green">
                      Day {day.day}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-primary-green/60">
                      <DollarSign className="w-4 h-4" />
                      <span>${day.totalCostUSD.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {day.activities.map((activity, activityIndex) => (
                      <Card key={activityIndex} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {activityIndex + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-primary-green mb-1">
                                  {activity.name}
                                </h3>
                                <div className="space-y-1 text-sm text-primary-green/60">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{activity.durationHours}h</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span>${activity.costUSD}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="inline-block mt-2 px-2 py-1 bg-primary-green/10 text-primary-green text-xs rounded-full">
                                  {activity.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeActivity(dayIndex, activityIndex)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </Card>
                    ))}

                    {/* Add Activity Button */}
                    <button
                      className="w-full p-3 border-2 border-dashed border-primary-green/30 rounded-lg hover:border-primary-green/50 hover:bg-white transition-all flex items-center justify-center gap-2 text-primary-green"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-sm font-medium">Add Activity</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-primary-cream pt-4 pb-safe space-y-3">
                <Button fullWidth onClick={handleConfirm}>
                  Confirm & View on Map
                </Button>
                <Button fullWidth variant="outline">
                  Regenerate Itinerary
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
