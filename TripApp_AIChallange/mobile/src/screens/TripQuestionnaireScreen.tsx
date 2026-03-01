import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Slider from '@react-native-community/slider';

type Props = NativeStackScreenProps<RootStackParamList, 'TripQuestionnaire'>;

export default function TripQuestionnaireScreen({ navigation, route }: Props) {
  const { type } = route.params;

  const [destination, setDestination] = useState('');
  const [startingPoint, setStartingPoint] = useState('');
  const [endingPoint, setEndingPoint] = useState('');
  const [duration, setDuration] = useState('3');
  const [budget, setBudget] = useState('500');
  const [busyness, setBusyness] = useState(0.5);
  const [travelWith, setTravelWith] = useState<'solo' | 'group'>('solo');
  const [includeGas, setIncludeGas] = useState(false);
  const [scenicRoute, setScenicRoute] = useState(true);
  const [includeTransport, setIncludeTransport] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Trip Details</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Tell us about your adventure</Text>
          <Text style={styles.subtitle}>
            We'll use these details to craft the perfect itinerary
          </Text>

          {/* Location Trip - Destination */}
          {type === 'location' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={require('../../assets/images/location-pin-icon.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>Destination</Text>
              </View>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Where do you want to go?"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {/* Road Trip - Starting and Ending Points */}
          {type === 'roadtrip' && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={require('../../assets/images/location-pin-icon.png')}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitle}>Starting Point</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={startingPoint}
                  onChangeText={setStartingPoint}
                  placeholder="Where will you start?"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={require('../../assets/images/location-pin-icon.png')}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitle}>Ending Point</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={endingPoint}
                  onChangeText={setEndingPoint}
                  placeholder="Where will you end?"
                  placeholderTextColor="#999"
                />
              </View>
            </>
          )}

          {/* Duration */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Duration (days)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="3"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.helperText}>How many days will you be exploring?</Text>
          </View>

          {/* Budget */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Budget ($)</Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="500"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.helperText}>Total budget for the trip</Text>
          </View>

          {/* Busyness Slider */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How busy do you want your days?</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={busyness}
              onValueChange={setBusyness}
              minimumTrackTintColor="#2F6F6D"
              maximumTrackTintColor="#E5D4C1"
              thumbTintColor="#2F6F6D"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Relaxed & chill</Text>
              <Text style={styles.sliderLabelCenter}>{Math.round(busyness * 100)}%</Text>
              <Text style={styles.sliderLabel}>Jam-packed</Text>
            </View>
          </View>

          {/* Traveling With */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Traveling with...</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  travelWith === 'solo' && styles.toggleButtonActive,
                ]}
                onPress={() => setTravelWith('solo')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/images/user-icon.png')}
                  style={[
                    styles.toggleIcon,
                    travelWith === 'solo' && styles.toggleIconActive,
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.toggleText,
                    travelWith === 'solo' && styles.toggleTextActive,
                  ]}
                >
                  Solo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  travelWith === 'group' && styles.toggleButtonActive,
                ]}
                onPress={() => setTravelWith('group')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/images/group-icon.png')}
                  style={[
                    styles.toggleIcon,
                    travelWith === 'group' && styles.toggleIconActive,
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.toggleText,
                    travelWith === 'group' && styles.toggleTextActive,
                  ]}
                >
                  Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Road Trip Preferences */}
          {type === 'roadtrip' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Road Trip Preferences</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIncludeGas(!includeGas)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, includeGas && styles.checkboxChecked]}>
                  {includeGas && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Include gas costs in budget</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setScenicRoute(!scenicRoute)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, scenicRoute && styles.checkboxChecked]}>
                  {scenicRoute && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Take the scenic route</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Location Trip Preferences */}
          {type === 'location' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trip Preferences</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIncludeTransport(!includeTransport)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, includeTransport && styles.checkboxChecked]}>
                  {includeTransport && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Include public transport costs in budget</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.backButtonBottom}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
            >
              <Text style={styles.generateButtonText}>Generate My Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  header: {
    backgroundColor: '#F4EBDC',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  backText: {
    fontSize: 18,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  sliderLabelCenter: {
    fontSize: 14,
    color: '#1F3D2B',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  toggleButtonActive: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  toggleIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  toggleIconActive: {
    tintColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 15,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F3D2B',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  backButtonBottom: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1F3D2B',
    fontSize: 16,
    fontWeight: '500',
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
