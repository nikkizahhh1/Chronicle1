import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import CategoryButton from '../components/ui/CategoryButton';

const CATEGORIES = [
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

export default function InterestQuiz() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const MIN_SELECTIONS = 3;
  const MAX_SELECTIONS = 5;

  const handleCategoryClick = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length < MAX_SELECTIONS) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedCategories.length >= MIN_SELECTIONS) {
      localStorage.setItem('quizResults', JSON.stringify({ interests: selectedCategories }));
      navigate('/signup');
    }
  };

  const canContinue = selectedCategories.length >= MIN_SELECTIONS;

  return (
    <Layout>
      <div className="min-h-screen flex flex-col px-6 py-8">
        <div className="flex-1">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-primary-green mb-2">
              Welcome to TripCraft
            </h1>
            <p className="text-primary-green/70 mb-8">
              Select {MIN_SELECTIONS}-{MAX_SELECTIONS} interests to help us personalize your travel experience
            </p>

            <div className="mb-4">
              <p className="text-sm text-primary-green/60">
                {selectedCategories.length} of {MAX_SELECTIONS} selected
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {CATEGORIES.map((category) => (
                <CategoryButton
                  key={category}
                  label={category}
                  selected={selectedCategories.includes(category)}
                  onClick={() => handleCategoryClick(category)}
                  disabled={
                    !selectedCategories.includes(category) &&
                    selectedCategories.length >= MAX_SELECTIONS
                  }
                />
              ))}
            </div>

            <Button
              fullWidth
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue
            </Button>
          </div>
        </div>

        <div className="pt-6 text-center">
          <Button variant="text" onClick={() => navigate('/login')}>
            Already have an account? Log in
          </Button>
        </div>
      </div>
    </Layout>
  );
}
