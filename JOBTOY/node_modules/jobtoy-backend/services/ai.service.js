const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const logger = require('../config/logger');
const Job = require('../models/Job.model');
const User = require('../models/User.model');

class AIService {
  constructor() {
    this.initialized = false;
    
    if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      logger.warn('AI matching engine credentials missing. Matching features will be disabled.');
      return;
    }

    try {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      this.indexName = process.env.PINECONE_INDEX_NAME;
      this.index = this.pinecone.Index(this.indexName);
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize AI matching engine:', error.message);
    }
  }

  async generateEmbedding(text) {
    if (!this.initialized) return null;
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error.message);
      return null;
    }
  }

  async upsertJob(job) {
    if (!this.initialized) return;
    try {
      // Create a rich text representation of the job
      const textToEmbed = `
        Title: ${job.title}
        Company: ${job.companyName}
        Location: ${job.location}
        Type: ${job.jobType}
        Description: ${job.description}
        Skills: ${job.skills.join(', ')}
        Requirements: ${job.qualifications.join(', ')}
        Responsibilities: ${job.responsibilities.join(', ')}
      `.replace(/\s+/g, ' ').trim();

      const embedding = await this.generateEmbedding(textToEmbed);
      if (!embedding) return;

      await this.index.namespace('jobs').upsert([{
        id: job._id.toString(),
        values: embedding,
        metadata: {
          title: job.title,
          companyName: job.companyName,
          location: job.location,
          isActive: job.isActive
        }
      }]);
      logger.info(`Upserted job to Pinecone: ${job._id}`);
    } catch (error) {
      logger.error('Error upserting job to Pinecone:', error.message);
    }
  }

  async upsertCandidate(user) {
    if (!this.initialized) return;
    try {
      const skillsText = user.skills?.join(', ') || '';
      const badgesText = user.skillBadges?.map(b => b.skillName).join(', ') || '';
      
      const textToEmbed = `
        Headline: ${user.headline || ''}
        Bio: ${user.bio || ''}
        Skills: ${skillsText} ${badgesText}
        Experience: ${user.experience || ''}
        Education: ${user.education || ''}
      `.replace(/\s+/g, ' ').trim();

      // Only embed if there's meaningful content
      if (textToEmbed.length < 10) return;

      const embedding = await this.generateEmbedding(textToEmbed);
      if (!embedding) return;

      await this.index.namespace('candidates').upsert([{
        id: user._id.toString(),
        values: embedding,
        metadata: {
          name: user.name,
          headline: user.headline || '',
          userType: user.userType
        }
      }]);
      logger.info(`Upserted candidate to Pinecone: ${user._id}`);
    } catch (error) {
      logger.error('Error upserting candidate to Pinecone:', error.message);
    }
  }

  async matchJobsForCandidate(userId) {
    if (!this.initialized) return [];
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const skillsText = user.skills?.join(', ') || '';
      const badgesText = user.skillBadges?.map(b => b.skillName).join(', ') || '';
      const textToEmbed = `
        Headline: ${user.headline || ''}
        Bio: ${user.bio || ''}
        Skills: ${skillsText} ${badgesText}
        Experience: ${user.experience || ''}
      `.replace(/\s+/g, ' ').trim();

      const queryEmbedding = await this.generateEmbedding(textToEmbed);
      if (!queryEmbedding) return [];

      const queryResponse = await this.index.namespace('jobs').query({
        topK: 10,
        vector: queryEmbedding,
        includeMetadata: true,
        filter: { isActive: true }
      });

      // Fetch full job details from MongoDB
      const jobIds = queryResponse.matches.map(m => m.id);
      const jobs = await Job.find({ _id: { $in: jobIds } })
        .populate('company', 'name logoUrl')
        .lean();

      // Sort jobs according to Pinecone score order
      const sortedJobs = queryResponse.matches
        .map(match => {
          const job = jobs.find(j => j._id.toString() === match.id);
          return job ? { ...job, matchScore: match.score } : null;
        })
        .filter(j => j !== null);

      return sortedJobs;
    } catch (error) {
      logger.error('Error matching jobs for candidate:', error.message);
      return [];
    }
  }

  async matchCandidatesForJob(jobId) {
    if (!this.initialized) return [];
    try {
      const job = await Job.findById(jobId);
      if (!job) return [];

      const textToEmbed = `
        Title: ${job.title}
        Type: ${job.jobType}
        Description: ${job.description}
        Skills: ${job.skills.join(', ')}
        Requirements: ${job.qualifications.join(', ')}
      `.replace(/\s+/g, ' ').trim();

      const queryEmbedding = await this.generateEmbedding(textToEmbed);
      if (!queryEmbedding) return [];

      const queryResponse = await this.index.namespace('candidates').query({
        topK: 10,
        vector: queryEmbedding,
        includeMetadata: true
      });

      // Fetch full user details from MongoDB
      const userIds = queryResponse.matches.map(m => m.id);
      const candidates = await User.find({ _id: { $in: userIds } }).select('-password -verificationToken').lean();

      // Sort candidates according to Pinecone score order
      const sortedCandidates = queryResponse.matches
        .map(match => {
          const candidate = candidates.find(c => c._id.toString() === match.id);
          return candidate ? { ...candidate, matchScore: match.score } : null;
        })
        .filter(c => c !== null);

      return sortedCandidates;
    } catch (error) {
      logger.error('Error matching candidates for job:', error.message);
      return [];
    }
  }
}

module.exports = new AIService();
