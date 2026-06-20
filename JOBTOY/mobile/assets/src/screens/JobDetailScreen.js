import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://api.jobtoy.com';

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { userToken, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, []);

  const fetchJobDetail = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${jobId}`);
      setJob(res.data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!userToken) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    setApplying(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/applications/apply`,
        {
          jobId,
          companyId: job.company._id,
          useProfileResume: true,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      Alert.alert('Success', 'Application submitted!');
      navigation.goBack();
    } catch (error) {
      console.error('Error applying:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.companyName}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>📍 {job.location}</Text>
          <Text style={styles.metaText}>💼 {job.jobType}</Text>
        </View>
      </View>

      {/* Salary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Salary</Text>
        <Text style={styles.salary}>
          ₹{(job.salary.min / 100000).toFixed(1)}L - ₹
          {(job.salary.max / 100000).toFixed(1)}L
        </Text>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Skills</Text>
        <View style={styles.skills}>
          {job.skills.map((skill) => (
            <Text key={skill} style={styles.skillTag}>
              {skill}
            </Text>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.applyBtn}
        onPress={handleApply}
        disabled={applying}
      >
        <Text style={styles.applyBtnText}>
          {applying ? 'Applying...' : 'Apply Now'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: '#2c3e50',
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  salary: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  applyBtn: {
    margin: 16,
    padding: 14,
    backgroundColor: '#FF6B35',
    borderRadius: 6,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 30,
  },
});