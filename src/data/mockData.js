export const predictiveData = [
  { day: 'Mon', actualPrice: 450, predictedPrice: 455, demandVol: 1200 },
  { day: 'Tue', actualPrice: 460, predictedPrice: 470, demandVol: 1350 },
  { day: 'Wed', actualPrice: 480, predictedPrice: 490, demandVol: 1500 },
  { day: 'Thu', actualPrice: 510, predictedPrice: 520, demandVol: 1800 },
  { day: 'Fri', actualPrice: null, predictedPrice: 550, demandVol: 2100 },
  { day: 'Sat', actualPrice: null, predictedPrice: 580, demandVol: 2400 },
  { day: 'Sun', actualPrice: null, predictedPrice: 600, demandVol: 2600 },
];

export const marketListings = [
  { id: 1, grade: 'Kangeta', farmer: 'John M.', location: 'Meru Central', price: 600, qty: 50, verified: true },
  { id: 2, grade: 'Alele', farmer: 'Sarah N.', location: 'Embu', price: 350, qty: 120, verified: true },
  { id: 3, grade: 'Giza', farmer: 'Peter K.', location: 'Igembe South', price: 850, qty: 30, verified: false },
  { id: 4, grade: 'Lomboko', farmer: 'David W.', location: 'Meru North', price: 450, qty: 80, verified: true },
];

export const trainingModules = [
  { id: 1, title: 'Sustainable Soil Management', type: 'Video', duration: '5 mins' },
  { id: 2, title: 'Water Conservation in Dry Seasons', type: 'Article', duration: '3 mins read' },
  { id: 3, title: 'Proper Harvesting Techniques', type: 'Video', duration: '8 mins' },
];

export const walletTransactions = [
  { id: 1, title: 'Payment from Peter K.', date: 'Today, 10:42 AM', amount: 12000, type: 'in' },
  { id: 2, title: 'Withdrawal to M-Pesa', date: 'Yesterday, 4:15 PM', amount: -5000, type: 'out' },
  { id: 3, title: 'Escrow Lock (Order #492)', date: 'Mon, 09:00 AM', amount: 8500, type: 'pending' },
];
