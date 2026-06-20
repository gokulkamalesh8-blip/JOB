import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://api.jobtoy.com';

export default function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (query = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('limit', '20');

      const res = await axios.get(
        `${API_URL}/api/jobs?${params.toString()}`
      );
      setJobs(res.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchJobs(searchQuery);
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
    >
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.companyName}>{item.companyName}</Text>
      <Text style={styles.location}>📍 {item.location}</Text>
      <Text style={styles.salary}>
        ₹{(item.salary.min / 100000).toFixed(1)}L - ₹
        {(item.salary.max / 100000).toFixed(1)}L
      </Text>
      <View style={styles.skills}>
        {item.skills.slice(0, 3).map((skill) => (
          <Text key={skill} style={styles.skillTag}>
            {skill}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No jobs found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  searchBtn: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    fontSize: 18,
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    padding: 16,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2c3e50',
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  location: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  salary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 12,
  },
  skills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  skillTag: {
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    color: '#333',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 30,
  },
});