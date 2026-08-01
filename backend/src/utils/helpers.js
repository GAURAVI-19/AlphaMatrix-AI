export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null
  });
};

export const errorResponse = (res, statusCode = 500, message = 'An error occurred', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: error || message
  });
};

export const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? req.query.search.trim() : '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  
  return { page, limit, skip, search, sortBy, sortOrder };
};

export const calculatePerformanceScore = (metrics) => {
  if (!metrics) return 0;
  
  const weights = {
    productivity: 0.3,
    attendance: 0.2,
    quality: 0.25,
    teamwork: 0.15,
    initiative: 0.1
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (metrics[key] !== undefined) {
      score += metrics[key] * weight;
    }
  }

  return Math.round(score * 100) / 100;
};

export const getPerformanceLevel = (score) => {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'GOOD';
  if (score >= 60) return 'AVERAGE';
  if (score >= 45) return 'BELOW_AVERAGE';
  return 'POOR';
};

export const calculateAttritionRisk = (tenure, satisfaction, salary, performance) => {
  let risk = 50; // base risk

  if (tenure < 1) risk += 20;
  if (satisfaction < 5) risk += 25;
  if (salary < 30000) risk += 15;
  if (performance < 3) risk += 20;

  return Math.min(risk, 100);
};

export const generateEthicalRiskScore = (prediction) => {
  let risk = 0;
  if (prediction.confidence < 0.6) risk += 30;
  if (prediction.confidence < 0.7 && prediction.confidence >= 0.6) risk += 20;
  return Math.min(risk, 100);
};

export const checkBias = (predictions, demographics) => {
  const groupPerformances = {};
  
  predictions.forEach(pred => {
    const group = demographics[pred.employeeId];
    if (group) {
      if (!groupPerformances[group]) {
        groupPerformances[group] = [];
      }
      groupPerformances[group].push(pred.score || 50);
    }
  });

  let hasBias = false;
  const groups = Object.keys(groupPerformances);
  
  if (groups.length > 1) {
    const avgScores = {};
    groups.forEach(group => {
      const scores = groupPerformances[group];
      avgScores[group] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    const maxAvg = Math.max(...Object.values(avgScores));
    const minAvg = Math.min(...Object.values(avgScores));
    
    if (maxAvg - minAvg > 15) {
      hasBias = true;
    }
  }

  return hasBias;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateDaysSince = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  return diff;
};
