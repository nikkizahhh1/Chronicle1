import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Mock data - will be replaced with real data from backend
const MOCK_TRIPS = [
  {
    id: '1',
    title: 'New York City Getaway',
    location: 'New York, NY',
    dates: 'Mar 15-18, 2026',
    budget: '$450 budget',
    image: require('../../assets/images/trip-placeholder.png'),
    status: 'Upcoming',
  },
  {
    id: '2',
    title: 'Desert Canyon Adventure',
    location: 'Arizona & Utah',
    dates: 'Apr 22-25, 2026',
    budget: '$380 budget',
    image: require('../../assets/images/trip-placeholder.png'),
    status: 'Upcoming',
  },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(255, 255, 255, 0.5)" translucent={false} />
      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/map-icon.png')}
            style={styles.mapIcon}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logoText}>Chronicle</Text>
            <Text style={styles.taglineText}>Travel like a local</Text>
            </View>
          </View>
            <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/friends-icon.png')}
              style={styles.friendsIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/profile-icon.png')}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* My Trips Section */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>My Trips</Text>
          <Text style={styles.sectionSubtitle}>
            Your curated collection of hidden{'\n'}weekend escapes
          </Text>

          {/* Start New Trip Button */}
          <TouchableOpacity
            style={styles.newTripButton}
            onPress={() => navigation.navigate('NewTrip')}
            activeOpacity={0.8}
          >
            <Text style={styles.newTripText}>+ Start New Trip</Text>
          </TouchableOpacity>

          {/* Trip Cards */}
          {MOCK_TRIPS.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripListView', { tripId: trip.id })}
              activeOpacity={0.9}
            >
              {/* Trip Image */}
              <View style={styles.tripImageContainer}>
                <Image
                  source={trip.image}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{trip.status}</Text>
                </View>
                <TouchableOpacity style={styles.tripMenuButton} activeOpacity={0.7}>
                  <View style={styles.menuDot} />
                  <View style={styles.menuDot} />
                  <View style={styles.menuDot} />
                </TouchableOpacity>
              </View>

              {/* Trip Info */}
              <View style={styles.tripInfo}>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <View style={styles.tripDetail}>
                  <Text style={styles.tripDetailIcon}>📍</Text>
                  <Text style={styles.tripDetailText}>{trip.location}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Text style={styles.tripDetailIcon}>📅</Text>
                  <Text style={styles.tripDetailText}>{trip.dates}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Text style={styles.tripDetailIcon}>💰</Text>
                  <Text style={styles.tripDetailText}>{trip.budget}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hidden Gem Score */}
        <View style={styles.hiddenGemCard}>
          <Image
            source={require('../../assets/images/hidden-gem-icon.png')}
            style={styles.hiddenGemIcon}
            resizeMode="contain"
          />
          <View style={styles.hiddenGemContent}>
            <Text style={styles.hiddenGemTitle}>Hidden Gem Score</Text>
            <Text style={styles.hiddenGemText}>
              Our AI finds places with low crowd risk and high local love. Every
              recommendation is curated, not just algorithmic.
            </Text>
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
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapIcon: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  taglineText: {
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 24,
    height: 24,
  },
  friendsIcon: {
    width: 24,
    height: 24,
  },
  profileButton: {
    width: 40,
    height: 40,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  newTripButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  newTripText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tripImageContainer: {
    position: 'relative',
    height: 180,
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2F6F6D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tripMenuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1F3D2B',
  },
  tripInfo: {
    padding: 16,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripDetailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#666',
  },
  hiddenGemCard: {
    flexDirection: 'row',
    backgroundColor: '#E8EBE4',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
    gap: 16,
  },
  hiddenGemIcon: {
    width: 56,
    height: 56,
  },
  hiddenGemContent: {
    flex: 1,
  },
  hiddenGemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  hiddenGemText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
