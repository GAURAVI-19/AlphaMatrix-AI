import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Branch from '../models/Branch.js';
import Course from '../models/Course.js';
import EthicalRule from '../models/EthicalRule.js';
import Prediction from '../models/Prediction.js';
import PredictionHistory from '../models/PredictionHistory.js';
import Approval from '../models/Approval.js';
import AuditLog from '../models/AuditLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alphamatrix';

const seedData = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    console.log('🧹 Clearing collections...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Branch.deleteMany({}),
      Course.deleteMany({}),
      EthicalRule.deleteMany({}),
      Prediction.deleteMany({}),
      PredictionHistory.deleteMany({}),
      Approval.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log('🧹 DB Cleared.');

    // 1. Create Branches
    console.log('🌱 Seeding Branches...');
    const branches = await Branch.insertMany([
      { name: 'Alpha HQ Node', code: 'BR-HQ', location: { city: 'New York', state: 'NY', country: 'USA', address: '120 Broadway', pincode: '10005' }, contact: { email: 'hq@alphamatrix.com', phone: '+1 555 1212' }, status: 'ACTIVE' },
      { name: 'West Coast Hub', code: 'BR-WEST', location: { city: 'San Francisco', state: 'CA', country: 'USA', address: '50 Fremont St', pincode: '94105' }, contact: { email: 'west@alphamatrix.com', phone: '+1 555 2323' }, status: 'ACTIVE' },
      { name: 'European Hub', code: 'BR-EU', location: { city: 'London', state: 'Greater London', country: 'UK', address: '30 St Mary Axe', pincode: 'EC3A 8EP' }, contact: { email: 'eu@alphamatrix.com', phone: '+44 20 7700 9000' }, status: 'ACTIVE' },
      { name: 'Asia Pacific Node', code: 'BR-APAC', location: { city: 'Tokyo', state: 'Tokyo', country: 'Japan', address: '1-1-2 Otemachi', pincode: '100-0004' }, contact: { email: 'apac@alphamatrix.com', phone: '+81 3 5555 5555' }, status: 'ACTIVE' }
    ]);
    const [hqBranch, westBranch, euBranch, apacBranch] = branches;
    console.log(`✅ Created ${branches.length} branches.`);

    // 2. Create Users
    console.log('🌱 Seeding Users...');
    // Admins
    const superAdmin = await User.create({
      name: 'Sarah Jenkins',
      email: 'admin@alphamatrix.com',
      password: 'Admin@123456',
      role: 'SUPER_ADMIN',
      phone: '+1 (555) 0101',
      department: 'Executive Governance',
      position: 'Chief Ethical Compliance Officer',
      status: 'ACTIVE',
      isVerified: true
    });

    const superAdmin2 = await User.create({
      name: 'Viva Admin',
      email: 'viva.admin@alphamatrix.com',
      password: 'Admin@123456',
      role: 'SUPER_ADMIN',
      phone: '+1 (555) 0102',
      department: 'AI Safety Research',
      position: 'Governance Director',
      status: 'ACTIVE',
      isVerified: true
    });

    // Managers
    const hqManager = await User.create({
      name: 'Michael Chen',
      email: 'manager@alphamatrix.com',
      password: 'Admin@123456',
      role: 'BRANCH_MANAGER',
      branch: hqBranch._id,
      phone: '+1 (555) 0201',
      department: 'Operations',
      position: 'General Manager - HQ',
      status: 'ACTIVE',
      isVerified: true
    });

    const westManager = await User.create({
      name: 'Elena Rostova',
      email: 'west.manager@alphamatrix.com',
      password: 'Admin@123456',
      role: 'BRANCH_MANAGER',
      branch: westBranch._id,
      phone: '+1 (555) 0202',
      department: 'Engineering',
      position: 'Engineering Director - West',
      status: 'ACTIVE',
      isVerified: true
    });

    // Employees
    const employeeUser1 = await User.create({
      name: 'John Doe',
      email: 'employee@alphamatrix.com',
      password: 'Admin@123456',
      role: 'EMPLOYEE',
      branch: hqBranch._id,
      phone: '+1 (555) 0301',
      department: 'Engineering',
      position: 'Senior Frontend Developer',
      status: 'ACTIVE',
      isVerified: true
    });

    const employeeUser2 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@alphamatrix.com',
      password: 'Admin@123456',
      role: 'EMPLOYEE',
      branch: hqBranch._id,
      phone: '+1 (555) 0302',
      department: 'Marketing',
      position: 'Marketing Manager',
      status: 'ACTIVE',
      isVerified: true
    });

    const employeeUser3 = await User.create({
      name: 'David Kim',
      email: 'david.kim@alphamatrix.com',
      password: 'Admin@123456',
      role: 'EMPLOYEE',
      branch: westBranch._id,
      phone: '+1 (555) 0303',
      department: 'Engineering',
      position: 'Data Engineer',
      status: 'ACTIVE',
      isVerified: true
    });

    const employeeUser4 = await User.create({
      name: 'Emily Watson',
      email: 'emily.watson@alphamatrix.com',
      password: 'Admin@123456',
      role: 'EMPLOYEE',
      branch: euBranch._id,
      phone: '+44 7700 900077',
      department: 'Sales',
      position: 'Enterprise Account Executive',
      status: 'ACTIVE',
      isVerified: true
    });

    const employeeUser5 = await User.create({
      name: 'Takashi Sato',
      email: 'takashi.sato@alphamatrix.com',
      password: 'Admin@123456',
      role: 'EMPLOYEE',
      branch: apacBranch._id,
      phone: '+81 90 0000 0000',
      department: 'Customer Success',
      position: 'Customer Success Advocate',
      status: 'ACTIVE',
      isVerified: true
    });

    console.log('✅ Created users and managers.');

    // Assign Managers to Branches
    hqBranch.manager = hqManager._id;
    await hqBranch.save();
    westBranch.manager = westManager._id;
    await westBranch.save();

    // 3. Create Courses
    console.log('🌱 Seeding Courses...');
    const courses = await Course.insertMany([
      { title: 'AI Ethics in Decision Systems', description: 'Analyze ethical frameworks, fairness criteria, and mitigation techniques in business predictions.', category: 'COMPLIANCE', duration: 180, provider: 'AlphaMatrix Academy', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE' },
      { title: 'Bias Mitigation in Neural Networks', description: 'Practical developer labs covering demographic parity, predictive parity, and input sanitization.', category: 'TECHNICAL', duration: 240, provider: 'AlphaMatrix Tech Group', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE' },
      { title: 'Enterprise Security Protocol', description: 'Corporate security standards, JWT key rotation protocols, and database sanitization rules.', category: 'SECURITY', duration: 120, provider: 'Cyber Security Institute', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE' },
      { title: 'Core Leadership and Governance', description: 'Human-in-the-loop management workflows, review protocols, and team coaching guidelines.', category: 'LEADERSHIP', duration: 150, provider: 'AlphaMatrix Leadership Academy', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE' },
      { title: 'Advanced Machine Learning Architectures', description: 'Explore SHAP value calculation, heuristic model modeling, and neural network optimization.', category: 'TECHNICAL', duration: 300, provider: 'DeepMind Tech Labs', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE' }
    ]);
    const [ethicsCourse, biasCourse, securityCourse, leaderCourse, mlCourse] = courses;
    console.log(`✅ Seeded ${courses.length} courses.`);

    // 4. Create Employee Profiles
    console.log('🌱 Seeding Employee Profiles...');
    const employees = await Employee.insertMany([
      {
        userId: employeeUser1._id,
        employeeId: 'EMP-001',
        branch: hqBranch._id,
        department: 'Engineering',
        position: 'Senior Frontend Developer',
        joinDate: new Date('2023-01-15'),
        salary: 115000,
        status: 'ACTIVE',
        performance: {
          currentScore: 88,
          level: 'GOOD',
          attendance: 96,
          productivity: 90,
          quality: 85,
          teamwork: 92,
          initiative: 80,
          lastReviewDate: new Date('2026-03-01'),
          historicalScores: [{ score: 85, date: new Date('2025-09-01'), reviewer: hqManager._id }]
        },
        skills: [
          { name: 'React', proficiency: 'EXPERT', acquiredDate: new Date('2020-05-10') },
          { name: 'Tailwind CSS', proficiency: 'ADVANCED', acquiredDate: new Date('2021-03-12') }
        ],
        courses: [ethicsCourse._id, securityCourse._id],
        certifications: [{ name: 'Certified React Developer', issuer: 'Meta', issueDate: new Date('2024-02-15') }],
        satisfactionScore: 8,
        attritionRisk: 14,
        metrics: { projectsCompleted: 12, targetsAchieved: 9, targetsSet: 10, absenceDays: 4 }
      },
      {
        userId: employeeUser2._id,
        employeeId: 'EMP-002',
        branch: hqBranch._id,
        department: 'Marketing',
        position: 'Marketing Manager',
        joinDate: new Date('2024-05-20'),
        salary: 95000,
        status: 'ACTIVE',
        performance: {
          currentScore: 78,
          level: 'GOOD',
          attendance: 94,
          productivity: 80,
          quality: 75,
          teamwork: 85,
          initiative: 75,
          lastReviewDate: new Date('2026-04-15')
        },
        skills: [{ name: 'SEO', proficiency: 'ADVANCED', acquiredDate: new Date('2022-10-01') }],
        courses: [ethicsCourse._id],
        satisfactionScore: 7,
        attritionRisk: 22,
        metrics: { projectsCompleted: 8, targetsAchieved: 6, targetsSet: 8, absenceDays: 6 }
      },
      {
        userId: employeeUser3._id,
        employeeId: 'EMP-003',
        branch: westBranch._id,
        department: 'Engineering',
        position: 'Data Engineer',
        joinDate: new Date('2025-06-10'),
        salary: 108000,
        status: 'ACTIVE',
        performance: {
          currentScore: 68,
          level: 'AVERAGE',
          attendance: 92,
          productivity: 70,
          quality: 65,
          teamwork: 70,
          initiative: 65,
          lastReviewDate: new Date('2026-05-01')
        },
        skills: [{ name: 'Python', proficiency: 'ADVANCED', acquiredDate: new Date('2023-01-10') }],
        courses: [mlCourse._id, biasCourse._id],
        satisfactionScore: 6,
        attritionRisk: 38,
        metrics: { projectsCompleted: 4, targetsAchieved: 3, targetsSet: 5, absenceDays: 8 }
      },
      {
        userId: employeeUser4._id,
        employeeId: 'EMP-004',
        branch: euBranch._id,
        department: 'Sales',
        position: 'Enterprise Account Executive',
        joinDate: new Date('2024-11-01'),
        salary: 130000,
        status: 'ON_PIP',
        performance: {
          currentScore: 48,
          level: 'POOR',
          attendance: 88,
          productivity: 45,
          quality: 50,
          teamwork: 55,
          initiative: 40,
          lastReviewDate: new Date('2026-05-10')
        },
        skills: [{ name: 'Negotiation', proficiency: 'EXPERT', acquiredDate: new Date('2021-08-20') }],
        courses: [leaderCourse._id],
        satisfactionScore: 2,
        attritionRisk: 82,
        metrics: { projectsCompleted: 2, targetsAchieved: 2, targetsSet: 8, absenceDays: 15 }
      },
      {
        userId: employeeUser5._id,
        employeeId: 'EMP-005',
        branch: apacBranch._id,
        department: 'Customer Success',
        position: 'Customer Success Advocate',
        joinDate: new Date('2025-02-15'),
        salary: 82000,
        status: 'ACTIVE',
        performance: {
          currentScore: 92,
          level: 'EXCELLENT',
          attendance: 98,
          productivity: 95,
          quality: 92,
          teamwork: 90,
          initiative: 95,
          lastReviewDate: new Date('2026-05-12')
        },
        skills: [{ name: 'Communication', proficiency: 'EXPERT', acquiredDate: new Date('2022-04-10') }],
        courses: [ethicsCourse._id, securityCourse._id],
        satisfactionScore: 9,
        attritionRisk: 8,
        metrics: { projectsCompleted: 15, targetsAchieved: 15, targetsSet: 15, absenceDays: 2 }
      }
    ]);
    console.log(`✅ Seeded ${employees.length} Employee Profiles.`);

    // Update branches employees references
    hqBranch.employees = [employees[0]._id, employees[1]._id];
    await hqBranch.save();
    westBranch.employees = [employees[2]._id];
    await westBranch.save();
    euBranch.employees = [employees[3]._id];
    await euBranch.save();
    apacBranch.employees = [employees[4]._id];
    await apacBranch.save();

    // 5. Create Ethical Rules
    console.log('🌱 Seeding Ethical Rules...');
    const rules = await EthicalRule.insertMany([
      {
        name: 'High Attrition Risk Firewall Limit',
        description: 'Requires multi-manager sign-off when a predicted employee attrition risk exceeds 70%. Stops automatic HR system alerts.',
        type: 'THRESHOLD_VALIDATION',
        ruleType: 'CUSTOM_THRESHOLD',
        thresholds: { minConfidence: 0.80, maxRisk: 0.70 },
        actions: [{ type: 'REQUIRE_APPROVAL', parameters: { roleRequired: 'BRANCH_MANAGER' } }],
        groups: ['TENURE', 'DEPARTMENT'],
        status: 'ACTIVE',
        priority: 'HIGH',
        createdBy: superAdmin._id,
        appliedCount: 15,
        violationCount: 2
      },
      {
        name: 'Demographic Equal Opportunity Filter',
        description: 'Checks for predictive parity between departments and tenure scales. Flags deviations exceeding 5%.',
        type: 'BIAS_CHECK',
        ruleType: 'DEMOGRAPHIC_PARITY',
        thresholds: { biasThreshold: 0.05 },
        actions: [{ type: 'NOTIFY', parameters: { channels: ['security-slack'] } }],
        groups: ['GENDER', 'DEPARTMENT'],
        status: 'ACTIVE',
        priority: 'MEDIUM',
        createdBy: superAdmin._id,
        appliedCount: 42,
        violationCount: 4
      },
      {
        name: 'Low Employee Satisfaction Bias Check',
        description: 'Audit trigger. Any prediction generated for users with a job satisfaction score <= 3 requires manual override to prevent AI-driven negative reinforcement loops.',
        type: 'BIAS_CHECK',
        ruleType: 'EQUAL_OPPORTUNITY',
        actions: [{ type: 'REQUIRE_APPROVAL', parameters: { roleRequired: 'SUPER_ADMIN' } }],
        groups: ['CUSTOM'],
        status: 'ACTIVE',
        priority: 'CRITICAL',
        createdBy: superAdmin2._id,
        appliedCount: 8,
        violationCount: 1
      },
      {
        name: 'Salary Compression Equality Check',
        description: 'Ensures performance index predictions are not biased by underlying base salary scales.',
        type: 'FAIRNESS_CHECK',
        ruleType: 'PREDICTIVE_PARITY',
        thresholds: { biasThreshold: 0.10 },
        actions: [{ type: 'LOG' }],
        groups: ['CUSTOM'],
        status: 'INACTIVE',
        priority: 'LOW',
        createdBy: superAdmin._id,
        appliedCount: 0,
        violationCount: 0
      }
    ]);
    console.log(`✅ Seeded ${rules.length} Ethical Rules.`);

    // 6. Create initial predictions & history
    console.log('🌱 Seeding Predictions & History...');
    const predictions = await Prediction.insertMany([
      {
        employee: employees[0]._id,
        type: 'PERFORMANCE',
        prediction: 85,
        confidence: 0.91,
        riskLevel: 'LOW',
        explanation: {
          features: [
            { name: 'productivity', importance: 0.45, value: '90' },
            { name: 'attendance', importance: 0.32, value: '96' }
          ],
          summary: 'High productivity and excellent attendance indices support performance gains.',
          details: 'The principal factor supporting this estimation is productivity.'
        },
        ethicalCheck: { passed: true, biasDetected: false, riskScore: 25 },
        status: 'ACTIVE',
        approval: { status: 'APPROVED', approvedBy: superAdmin._id, approvalDate: new Date() }
      },
      {
        employee: employees[3]._id,
        type: 'ATTRITION',
        prediction: 82,
        confidence: 0.88,
        riskLevel: 'HIGH',
        explanation: {
          features: [
            { name: 'satisfactionScore', importance: 0.65, value: '2' },
            { name: 'absenceDays', importance: 0.42, value: '15' }
          ],
          summary: 'Extreme risk driven by low job satisfaction (2/10) and high absenteeism.',
          details: 'Underlying score reflects systemic issues in sales organization department.'
        },
        ethicalCheck: { passed: false, biasDetected: true, biasDetails: 'Risk 82% exceeds limit of 70% set by rule: "High Attrition Risk Firewall Limit"', riskScore: 65 },
        status: 'ACTIVE',
        approval: { status: 'PENDING' }
      }
    ]);

    await PredictionHistory.insertMany([
      { employee: employees[0]._id, prediction: 85, riskLevel: 'LOW', type: 'PERFORMANCE', inputData: { productivity: 90, attendance: 96 }, shapValues: [{ name: 'productivity', importance: 0.45, value: '90' }] },
      { employee: employees[3]._id, prediction: 82, riskLevel: 'HIGH', type: 'ATTRITION', inputData: { satisfactionScore: 2, absenceDays: 15 }, shapValues: [{ name: 'satisfactionScore', importance: 0.65, value: '2' }] }
    ]);
    console.log('✅ Seeded initial predictions.');

    // 7. Create Approvals
    console.log('🌱 Seeding Approvals Queue...');
    await Approval.create({
      prediction: predictions[1]._id,
      employee: employees[3]._id,
      createdBy: hqManager._id,
      type: 'Attrition Firewall Bypass Sign-off',
      description: 'Requesting permission to bypass systemic lock for high risk attrition prediction (82%). Employee Emily Watson has entered active PIP.',
      riskLevel: 'HIGH',
      requiredApprovals: 1,
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      comments: [
        { author: hqManager._id, text: 'This employee has had several sales issues and we have initiated a PIP. Need admin override to process the full assessment.', timestamp: new Date() }
      ],
      metadata: {
        department: 'Sales',
        branch: euBranch._id,
        impact: 'High client impact due to account transitions.'
      }
    });
    console.log('✅ Seeded approvals.');

    // 8. Create Audit Logs
    console.log('🌱 Seeding Audit Logs...');
    await AuditLog.create([
      { user: superAdmin._id, action: 'SEED_SYSTEM', module: 'SETTINGS', status: 'SUCCESS', method: 'POST', ipAddress: '127.0.0.1' },
      { user: superAdmin._id, action: 'CREATE_ETHICAL_RULE', module: 'SETTINGS', entity: { type: 'EthicalRule', id: rules[0]._id }, status: 'SUCCESS', method: 'POST' },
      { user: hqManager._id, action: 'CREATE_APPROVAL', module: 'APPROVAL', entity: { type: 'Approval' }, status: 'SUCCESS', method: 'POST' }
    ]);
    console.log('✅ Seeded audit logs.');

    console.log('🚀 DATABASE SEED COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
