const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User    = require('../models/User.model');
const Company = require('../models/Company.model');
const Job     = require('../models/Job.model');

const MONGO_URI = process.env.MONGO_URI;

// ─── Real Companies ───────────────────────────────────────────────────────────
const COMPANIES = [
  { name:'Google',       industry:'Technology',    size:'500+', location:'Bangalore', website:'https://google.com',       description:'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and more.' },
  { name:'Microsoft',    industry:'Technology',    size:'500+', location:'Hyderabad', website:'https://microsoft.com',    description:'Microsoft Corporation develops, manufactures, licenses, supports, and sells computer software, consumer electronics, and personal computers.' },
  { name:'Amazon',       industry:'E-Commerce',    size:'500+', location:'Hyderabad', website:'https://amazon.com',       description:'Amazon.com, Inc. is a global technology company focusing on e-commerce, cloud computing (AWS), digital streaming, and AI.' },
  { name:'TCS',          industry:'IT Services',   size:'500+', location:'Mumbai',    website:'https://tcs.com',          description:'Tata Consultancy Services is an Indian multinational IT services and consulting company headquartered in Mumbai.' },
  { name:'Infosys',      industry:'IT Services',   size:'500+', location:'Bangalore', website:'https://infosys.com',      description:'Infosys Limited is an Indian multinational IT company providing business consulting, IT, and outsourcing services.' },
  { name:'Wipro',        industry:'IT Services',   size:'500+', location:'Bangalore', website:'https://wipro.com',        description:'Wipro Limited is an Indian multinational corporation providing IT, consulting, and business process services.' },
  { name:'HCL Tech',     industry:'IT Services',   size:'500+', location:'Noida',     website:'https://hcltech.com',      description:'HCL Technologies is an Indian multinational IT services company providing services in IT and business process outsourcing.' },
  { name:'Flipkart',     industry:'E-Commerce',    size:'500+', location:'Bangalore', website:'https://flipkart.com',     description:'Flipkart Internet Pvt Ltd is an Indian e-commerce company headquartered in Bangalore, owned by Walmart.' },
  { name:'Swiggy',       industry:'Food Tech',     size:'500+', location:'Bangalore', website:'https://swiggy.com',       description:'Swiggy is India\'s leading food ordering and delivery platform, operating in 500+ cities across India.' },
  { name:'Zomato',       industry:'Food Tech',     size:'500+', location:'Gurugram',  website:'https://zomato.com',       description:'Zomato is an Indian restaurant aggregator and food delivery company operating in India and several countries.' },
  { name:'Razorpay',     industry:'Fintech',       size:'201-500', location:'Bangalore', website:'https://razorpay.com',  description:'Razorpay is India\'s leading full-stack financial solutions company helping businesses with payments and banking.' },
  { name:'PhonePe',      industry:'Fintech',       size:'500+', location:'Bangalore', website:'https://phonepe.com',      description:'PhonePe is a digital payments company headquartered in Bangalore, India, using the UPI platform.' },
  { name:'Paytm',        industry:'Fintech',       size:'500+', location:'Noida',     website:'https://paytm.com',        description:'One97 Communications (Paytm) is India\'s leading financial services company providing payments and commerce.' },
  { name:'CRED',         industry:'Fintech',       size:'201-500', location:'Bangalore', website:'https://cred.club',     description:'CRED is a fintech startup that rewards creditworthy individuals for paying their credit card bills on time.' },
  { name:'Ola',          industry:'Transport',     size:'500+', location:'Bangalore', website:'https://olacabs.com',      description:'ANI Technologies (Ola) is India\'s largest ride-hailing and electric vehicles platform.' },
  { name:'Nykaa',        industry:'E-Commerce',    size:'201-500', location:'Mumbai',  website:'https://nykaa.com',       description:'Nykaa is a multi-brand beauty, wellness and fashion retail company, selling through website and app.' },
  { name:'Freshworks',   industry:'SaaS',          size:'500+', location:'Chennai',   website:'https://freshworks.com',   description:'Freshworks provides cloud-based CRM, customer support, ITSM, and HR management software.' },
  { name:'Zoho',         industry:'SaaS',          size:'500+', location:'Chennai',   website:'https://zoho.com',         description:'Zoho Corporation is an Indian multinational technology company that makes web-based business tools and IT solutions.' },
  { name:'Myntra',       industry:'E-Commerce',    size:'500+', location:'Bangalore', website:'https://myntra.com',       description:'Myntra is an Indian fashion e-commerce company offering clothing, accessories, and beauty products.' },
  { name:'Byju\'s',      industry:'EdTech',        size:'500+', location:'Bangalore', website:'https://byjus.com',        description:'BYJU\'S is an Indian multinational educational technology company founded in 2011.' },
  { name:'Unacademy',    industry:'EdTech',        size:'201-500', location:'Bangalore', website:'https://unacademy.com', description:'Unacademy is an Indian online education technology company that offers online and test preparation courses.' },
  { name:'Dream11',      industry:'Gaming',        size:'201-500', location:'Mumbai',  website:'https://dream11.com',     description:'Dream Sports (Dream11) is India\'s largest sports tech company and fantasy sports platform.' },
  { name:'Meesho',       industry:'E-Commerce',    size:'201-500', location:'Bangalore', website:'https://meesho.com',    description:'Meesho is an Indian social commerce platform that enables small businesses and individuals to start their online stores.' },
  { name:'Groww',        industry:'Fintech',       size:'201-500', location:'Bangalore', website:'https://groww.in',      description:'Groww is an Indian investment platform providing simple and accessible investment services to retail investors.' },
  { name:'Zepto',        industry:'Quick Commerce', size:'201-500', location:'Mumbai', website:'https://zeptonow.com',    description:'Zepto is India\'s fastest growing quick commerce startup delivering groceries in 10 minutes.' },
  { name:'Lenskart',     industry:'Retail',        size:'201-500', location:'New Delhi', website:'https://lenskart.com',  description:'Lenskart is India\'s leading eyewear brand offering prescription glasses, sunglasses, and contact lenses.' },
  { name:'Dunzo',        industry:'Quick Commerce', size:'51-200', location:'Bangalore', website:'https://dunzo.com',     description:'Dunzo is a hyperlocal delivery startup operating across major Indian cities.' },
  { name:'Udaan',        industry:'B2B Commerce',  size:'500+', location:'Bangalore', website:'https://udaan.com',        description:'Udaan is a B2B trade platform connecting manufacturers, wholesalers, retailers, and traders across India.' },
  { name:'Delhivery',    industry:'Logistics',     size:'500+', location:'Gurugram',  website:'https://delhivery.com',    description:'Delhivery is India\'s largest fully integrated logistics service provider.' },
  { name:'Urban Company', industry:'Services',     size:'201-500', location:'Gurugram', website:'https://urbancompany.com', description:'Urban Company is India\'s largest home services marketplace offering beauty, fitness, and repair services.' },
  { name:'MakeMyTrip',   industry:'Travel',        size:'500+', location:'Gurugram',  website:'https://makemytrip.com',   description:'MakeMyTrip is India\'s leading online travel company providing travel and hotel booking services.' },
  { name:'Ixigo',        industry:'Travel',        size:'51-200', location:'Gurugram', website:'https://ixigo.com',       description:'Ixigo is an Indian AI-powered travel app for trains, flights, buses and hotels.' },
  { name:'BigBasket',    industry:'Grocery',       size:'500+', location:'Bangalore', website:'https://bigbasket.com',    description:'BigBasket is India\'s largest online food and grocery store, now part of the Tata Group.' },
  { name:'Practo',       industry:'Healthtech',    size:'201-500', location:'Bangalore', website:'https://practo.com',    description:'Practo is a healthcare technology company providing services in online doctor consultation and clinic software.' },
  { name:'Pharmeasy',    industry:'Healthtech',    size:'500+', location:'Mumbai',    website:'https://pharmeasy.in',     description:'PharmEasy is a healthcare aggregator platform providing medicines, diagnostics and medical equipment online.' },
  { name:'PolicyBazaar', industry:'Insurtech',     size:'500+', location:'Gurugram',  website:'https://policybazaar.com', description:'PolicyBazaar is India\'s largest online marketplace for insurance products.' },
  { name:'Cars24',       industry:'Automotive',    size:'500+', location:'Gurugram',  website:'https://cars24.com',       description:'CARS24 is India\'s largest used car buying and selling platform with a transparent process.' },
  { name:'Spinny',       industry:'Automotive',    size:'201-500', location:'Gurugram', website:'https://spinny.com',     description:'Spinny is a full-stack used car retailing platform offering a transparent and hassle-free car buying experience.' },
  { name:'Cashfree',     industry:'Fintech',       size:'51-200', location:'Bangalore', website:'https://cashfree.com',   description:'Cashfree Payments is a leading payment and banking technology company in India.' },
  { name:'Browserstack', industry:'SaaS',          size:'201-500', location:'Mumbai',  website:'https://browserstack.com', description:'BrowserStack is a cloud web and mobile testing platform providing developers with instant access to browser environments.' },
  { name:'Postman',      industry:'DevTools',      size:'201-500', location:'Bangalore', website:'https://postman.com',   description:'Postman is an API platform for building and using APIs, simplifying each step of the API lifecycle.' },
  { name:'HasGeek',      industry:'Technology',    size:'11-50', location:'Bangalore', website:'https://hasgeek.com',     description:'HasGeek builds online and offline communities for technology practitioners.' },
  { name:'Chargebee',    industry:'SaaS',          size:'201-500', location:'Chennai',  website:'https://chargebee.com',  description:'Chargebee is a subscription billing and revenue management platform for SaaS businesses.' },
  { name:'Cleartax',     industry:'Fintech',       size:'201-500', location:'Bangalore', website:'https://cleartax.in',   description:'ClearTax is India\'s largest tax platform providing income tax filing, GST compliance, and investment services.' },
  { name:'Curefit',      industry:'Healthtech',    size:'201-500', location:'Bangalore', website:'https://cure.fit',      description:'Cure.fit (now MindHouse) is a health and fitness company offering exercise, nutrition, and mental well-being services.' },
  { name:'Rivigo',       industry:'Logistics',     size:'201-500', location:'Gurugram', website:'https://rivigo.com',     description:'Rivigo is a tech-enabled logistics company that uses relay trucking model for faster and more efficient delivery.' },
  { name:'Khatabook',    industry:'Fintech',       size:'201-500', location:'Bangalore', website:'https://khatabook.com', description:'Khatabook is a digital ledger app for MSMEs and small business owners to manage accounts digitally.' },
  { name:'OkCredit',     industry:'Fintech',       size:'51-200', location:'Bangalore', website:'https://okcredit.in',    description:'OkCredit is a digital ledger app helping small businesses track credit and payments digitally.' },
  { name:'Darwinbox',    industry:'HRtech',        size:'201-500', location:'Hyderabad', website:'https://darwinbox.com', description:'Darwinbox is a leading cloud-based HR technology platform serving enterprises across Asia.' },
  { name:'Leadsquared',  industry:'SaaS',          size:'201-500', location:'Bangalore', website:'https://leadsquared.com', description:'LeadSquared is a leading CRM and marketing automation platform used by education, healthcare, and financial companies.' },
];

// ─── Job Templates ────────────────────────────────────────────────────────────
const ROLES = [
  { title:'Software Engineer',          category:'Technology',    skills:['JavaScript','React','Node.js','Git','REST APIs'],        salaryRange:[800000,1800000] },
  { title:'Senior Software Engineer',   category:'Technology',    skills:['TypeScript','React','AWS','Microservices','Docker'],     salaryRange:[1500000,3500000] },
  { title:'Full Stack Developer',       category:'Technology',    skills:['React','Node.js','MongoDB','Express','Redux'],           salaryRange:[900000,2200000] },
  { title:'Backend Engineer',           category:'Technology',    skills:['Node.js','Python','PostgreSQL','Redis','Kafka'],         salaryRange:[1000000,2500000] },
  { title:'Frontend Developer',         category:'Technology',    skills:['React','TypeScript','CSS','Webpack','Jest'],             salaryRange:[700000,1800000] },
  { title:'DevOps Engineer',            category:'Technology',    skills:['AWS','Docker','Kubernetes','CI/CD','Terraform'],         salaryRange:[1200000,2800000] },
  { title:'Data Scientist',             category:'Data & Analytics', skills:['Python','Machine Learning','TensorFlow','SQL','Statistics'], salaryRange:[1000000,2500000] },
  { title:'Data Analyst',               category:'Data & Analytics', skills:['SQL','Python','Tableau','Excel','Power BI'],          salaryRange:[600000,1400000] },
  { title:'Machine Learning Engineer',  category:'Data & Analytics', skills:['Python','TensorFlow','PyTorch','MLOps','Scikit-learn'], salaryRange:[1400000,3200000] },
  { title:'Data Engineer',              category:'Data & Analytics', skills:['Apache Spark','Kafka','Airflow','Python','SQL'],      salaryRange:[1200000,2600000] },
  { title:'Product Manager',            category:'Product',       skills:['Product Strategy','Agile','User Research','SQL','Roadmapping'], salaryRange:[1500000,4000000] },
  { title:'Senior Product Manager',     category:'Product',       skills:['Product Vision','OKRs','A/B Testing','Analytics','Leadership'], salaryRange:[2500000,5500000] },
  { title:'UX Designer',                category:'Design',        skills:['Figma','User Research','Prototyping','Wireframing','Design Systems'], salaryRange:[700000,1800000] },
  { title:'UI Designer',                category:'Design',        skills:['Figma','Adobe XD','CSS','Illustration','Animation'],    salaryRange:[600000,1500000] },
  { title:'Product Designer',           category:'Design',        skills:['Figma','UX Research','Design Thinking','Prototyping','Usability Testing'], salaryRange:[900000,2200000] },
  { title:'Cloud Architect',            category:'Technology',    skills:['AWS','Azure','GCP','Solution Architecture','Terraform'], salaryRange:[2000000,4500000] },
  { title:'Security Engineer',          category:'Technology',    skills:['Cybersecurity','Penetration Testing','SIEM','Firewalls','Python'], salaryRange:[1400000,3000000] },
  { title:'Android Developer',          category:'Technology',    skills:['Kotlin','Android SDK','MVVM','Retrofit','Room DB'],     salaryRange:[800000,2000000] },
  { title:'iOS Developer',              category:'Technology',    skills:['Swift','SwiftUI','Xcode','Core Data','Combine'],        salaryRange:[900000,2200000] },
  { title:'QA Engineer',                category:'Technology',    skills:['Selenium','Cypress','JIRA','Test Automation','API Testing'], salaryRange:[600000,1500000] },
  { title:'Site Reliability Engineer',  category:'Technology',    skills:['Linux','Prometheus','Grafana','Kubernetes','On-call'],  salaryRange:[1400000,3000000] },
  { title:'HR Manager',                 category:'Human Resources', skills:['Recruitment','HRIS','Employee Relations','Payroll','Compliance'], salaryRange:[700000,1600000] },
  { title:'HR Business Partner',        category:'Human Resources', skills:['Strategic HR','Talent Management','Org Design','People Analytics'], salaryRange:[1000000,2500000] },
  { title:'Talent Acquisition Specialist', category:'Human Resources', skills:['Sourcing','Interviewing','LinkedIn Recruiter','ATS','Employer Branding'], salaryRange:[500000,1200000] },
  { title:'Marketing Manager',          category:'Marketing',     skills:['Digital Marketing','SEO','SEM','Content Strategy','Analytics'], salaryRange:[800000,1800000] },
  { title:'Growth Hacker',              category:'Marketing',     skills:['A/B Testing','SEO','Social Media','Analytics','Email Marketing'], salaryRange:[700000,1600000] },
  { title:'Content Strategist',         category:'Marketing',     skills:['Content Writing','SEO','Social Media','CMS','Brand Voice'], salaryRange:[500000,1200000] },
  { title:'Performance Marketer',       category:'Marketing',     skills:['Google Ads','Meta Ads','Analytics','CRO','Attribution'], salaryRange:[700000,1800000] },
  { title:'Sales Manager',              category:'Sales',         skills:['B2B Sales','CRM','Negotiation','Pipeline Management','Forecasting'], salaryRange:[900000,2500000] },
  { title:'Business Development Manager', category:'Sales',       skills:['Business Development','Lead Generation','Partnerships','CRM','Outreach'], salaryRange:[800000,2000000] },
  { title:'Finance Manager',            category:'Finance',       skills:['Financial Modeling','Excel','SAP','Budgeting','FP&A'], salaryRange:[1000000,2500000] },
  { title:'Chartered Accountant',       category:'Finance',       skills:['Taxation','Audit','GST','Tally','Financial Reporting'], salaryRange:[700000,1800000] },
  { title:'Operations Manager',         category:'Operations',    skills:['Process Improvement','Six Sigma','Supply Chain','ERP','Team Management'], salaryRange:[900000,2200000] },
  { title:'Customer Success Manager',   category:'Operations',    skills:['Customer Onboarding','Retention','NPS','CRM','SaaS'],  salaryRange:[700000,1600000] },
  { title:'Scrum Master',               category:'Technology',    skills:['Agile','Scrum','Jira','Kanban','Facilitation'],        salaryRange:[900000,2200000] },
  { title:'Technical Lead',             category:'Technology',    skills:['System Design','Code Review','Mentoring','Microservices','Architecture'], salaryRange:[2000000,4200000] },
  { title:'Engineering Manager',        category:'Technology',    skills:['Team Leadership','Hiring','System Design','Roadmapping','Agile'], salaryRange:[2800000,6000000] },
  { title:'Data Architect',             category:'Data & Analytics', skills:['Data Modeling','ETL','Snowflake','dbt','Data Governance'], salaryRange:[2000000,4000000] },
  { title:'Blockchain Developer',        category:'Technology',   skills:['Solidity','Ethereum','Web3.js','Smart Contracts','DeFi'], salaryRange:[1500000,3500000] },
  { title:'Fresher Software Developer', category:'Technology',    skills:['Java','Python','Data Structures','Algorithms','Git'],  salaryRange:[400000,800000] },
];

const LOCATIONS = ['Bangalore','Mumbai','Hyderabad','Chennai','Pune','Noida','Gurugram','Delhi','Kolkata','Ahmedabad','Remote'];
const TYPES     = ['full-time','part-time','contract','internship'];
const EXP_BANDS = [
  { min:0,  max:1  },
  { min:1,  max:3  },
  { min:2,  max:5  },
  { min:3,  max:7  },
  { min:5,  max:10 },
  { min:7,  max:15 },
  { min:0,  max:0  }, // fresher
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function buildDescription(role, company) {
  return `
<b>${company.name}</b> is hiring a <b>${role.title}</b> to join our growing team in ${company.location}.

<h3>About the Role</h3>
<p>As a ${role.title}, you will work closely with cross-functional teams to deliver high-quality solutions that impact millions of users. You'll be part of an exciting, fast-paced environment where innovation and collaboration are at the core of everything we do.</p>

<h3>Key Responsibilities</h3>
<ul>
  <li>Design, develop, and maintain scalable and reliable software systems</li>
  <li>Collaborate with product managers, designers, and other engineers to define and build new features</li>
  <li>Write clean, maintainable code with proper documentation</li>
  <li>Participate in code reviews and contribute to best practices</li>
  <li>Troubleshoot and debug production issues in a timely manner</li>
  <li>Continuously improve the quality, performance, and reliability of the systems</li>
  <li>Mentor junior team members and share knowledge across the team</li>
</ul>

<h3>Required Skills</h3>
<ul>
  ${role.skills.map(s => `<li>${s}</li>`).join('\n  ')}
</ul>

<h3>What We Offer</h3>
<ul>
  <li>Competitive salary and equity</li>
  <li>Health insurance for you and your family</li>
  <li>Flexible work hours and hybrid/remote options</li>
  <li>Learning & development budget</li>
  <li>Team outings and company events</li>
  <li>Free meals and snacks (for in-office roles)</li>
</ul>

<h3>About ${company.name}</h3>
<p>${company.description}</p>
  `.trim();
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seeded data
    console.log('🗑  Clearing existing data...');
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({ email: { $regex: /@seedemployer\.com$/ } });

    // Create one seed employer user
    const employer = await User.create({
      name:     'JobPortal Seed Admin',
      email:    'seed@seedemployer.com',
      password: 'Seed@12345',
      role:     'employer',
    });
    console.log('👤 Seed employer created');

    // Create all companies
    console.log('🏢 Creating companies...');
    const createdCompanies = await Promise.all(
      COMPANIES.map(c => Company.create({
        owner:       employer._id,
        name:        c.name,
        description: c.description,
        website:     c.website,
        location:    c.location,
        industry:    c.industry,
        size:        c.size,
        logoUrl:     `https://logo.clearbit.com/${new URL(c.website).hostname}`,
      }))
    );
    console.log(`✅ ${createdCompanies.length} companies created`);

    // Generate 5000+ jobs
    console.log('💼 Generating 5000+ jobs...');
    const jobs = [];
    let count = 0;

    // Each company gets ~100 jobs across multiple roles, locations, experience levels
    for (const company of createdCompanies) {
      const jobsPerCompany = randInt(80, 130);
      for (let i = 0; i < jobsPerCompany; i++) {
        const role    = pick(ROLES);
        const expBand = pick(EXP_BANDS);
        const loc     = pick(LOCATIONS);
        const type    = pick(TYPES);
        const isRemote = loc === 'Remote' || Math.random() < 0.15;

        const salMin = Math.round(role.salaryRange[0] * (0.8 + Math.random() * 0.4) / 10000) * 10000;
        const salMax = Math.round(role.salaryRange[1] * (0.8 + Math.random() * 0.4) / 10000) * 10000;

        // Create varied job titles
        const prefixes = ['Senior', 'Junior', 'Lead', 'Principal', 'Staff', ''];
        const prefix = Math.random() < 0.4 ? pick(prefixes) : '';
        const finalTitle = prefix ? `${prefix} ${role.title}` : role.title;

        jobs.push({
          company:     company._id,
          postedBy:    employer._id,
          title:       finalTitle,
          description: buildDescription({ ...role, title: finalTitle }, company),
          type,
          location:    isRemote ? 'Remote' : loc,
          remote:      isRemote,
          salary:      { min: salMin, max: salMax, currency: 'INR' },
          skills:      role.skills,
          status:      'open',
          experience:  expBand,
          category:    role.category,
          openings:    randInt(1, 10),
          applicants:  randInt(0, 500),
          deadline:    new Date(Date.now() + randInt(15, 90) * 24 * 60 * 60 * 1000),
          createdAt:   new Date(Date.now() - randInt(0, 30) * 24 * 60 * 60 * 1000),
        });
        count++;
      }
    }

    // Insert in batches of 500
    const BATCH = 500;
    for (let i = 0; i < jobs.length; i += BATCH) {
      await Job.insertMany(jobs.slice(i, i + BATCH), { ordered: false });
      console.log(`  Inserted jobs ${i + 1}–${Math.min(i + BATCH, jobs.length)}`);
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Companies : ${createdCompanies.length}`);
    console.log(`   Jobs      : ${count}`);
    console.log(`\n   Seed employer email    : seed@seedemployer.com`);
    console.log(`   Seed employer password : Seed@12345`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
