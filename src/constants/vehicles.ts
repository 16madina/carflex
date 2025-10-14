// Marques de véhicules populaires
export const CAR_BRANDS = [
  "Toyota", "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Ford", "Honda", "Nissan",
  "Hyundai", "Kia", "Mazda", "Peugeot", "Renault", "Citroën", "Fiat", "Jeep",
  "Land Rover", "Range Rover", "Lexus", "Infiniti", "Acura", "Chevrolet", "Dodge",
  "Subaru", "Mitsubishi", "Suzuki", "Isuzu", "Daihatsu", "Volvo", "Porsche",
  "Ferrari", "Lamborghini", "Maserati", "Bentley", "Rolls-Royce", "Aston Martin",
  "Jaguar", "Tesla", "BYD", "Geely", "Chery", "Haval", "MG", "Autre"
];

// Modèles par marque
export const CAR_MODELS: Record<string, string[]> = {
  "Toyota": ["Corolla", "Camry", "RAV4", "Highlander", "Prius", "Land Cruiser", "Hilux", "Yaris", "Avalon", "4Runner", "Tacoma", "Tundra", "Sequoia", "Sienna", "C-HR", "Venza"],
  "Mercedes-Benz": ["Classe A", "Classe C", "Classe E", "Classe S", "GLA", "GLB", "GLC", "GLE", "GLS", "CLA", "CLS", "G-Class", "EQC", "EQS", "AMG GT", "Maybach"],
  "BMW": ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "Série 6", "Série 7", "Série 8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "iX", "M2", "M3", "M4", "M5", "M8"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "TT", "R8", "e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS7"],
  "Volkswagen": ["Golf", "Polo", "Passat", "Tiguan", "Touareg", "T-Roc", "T-Cross", "Arteon", "ID.3", "ID.4", "ID.5", "Jetta", "Beetle", "Atlas", "Taos"],
  "Ford": ["Fiesta", "Focus", "Mustang", "Explorer", "Escape", "Edge", "Expedition", "F-150", "Ranger", "Bronco", "Maverick", "EcoSport", "Puma", "Kuga", "Mondeo"],
  "Honda": ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Odyssey", "Ridgeline", "Passport", "Fit", "Insight", "Clarity", "e", "City"],
  "Nissan": ["Sentra", "Altima", "Maxima", "Versa", "Rogue", "Murano", "Pathfinder", "Armada", "Kicks", "Qashqai", "X-Trail", "Juke", "GT-R", "370Z", "Leaf", "Ariya"],
  "Hyundai": ["Elantra", "Sonata", "Accent", "Tucson", "Santa Fe", "Palisade", "Kona", "Venue", "Ioniq", "Ioniq 5", "Ioniq 6", "Nexo", "Veloster"],
  "Kia": ["Forte", "K5", "Stinger", "Rio", "Soul", "Seltos", "Sportage", "Sorento", "Telluride", "Niro", "EV6", "Carnival", "Picanto"],
  "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "CX-50", "CX-60", "MX-5 Miata", "MX-30"],
  "Peugeot": ["208", "308", "508", "2008", "3008", "5008", "Rifter", "Partner", "Traveller", "e-208", "e-2008"],
  "Renault": ["Clio", "Megane", "Captur", "Kadjar", "Koleos", "Talisman", "Scenic", "Espace", "Twingo", "Zoe", "Kangoo"],
  "Citroën": ["C3", "C4", "C5 Aircross", "Berlingo", "SpaceTourer", "C3 Aircross", "C1", "C5 X", "ë-C4"],
  "Fiat": ["500", "500X", "500L", "Panda", "Tipo", "Doblo", "Ducato", "500e"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer", "Grand Wagoneer"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
  "Range Rover": ["Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
  "Lexus": ["IS", "ES", "GS", "LS", "UX", "NX", "RX", "GX", "LX", "LC", "RC"],
  "Infiniti": ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  "Acura": ["ILX", "TLX", "RLX", "RDX", "MDX", "NSX"],
  "Chevrolet": ["Spark", "Sonic", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", "Trax", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban", "Silverado", "Colorado"],
  "Dodge": ["Charger", "Challenger", "Durango", "Journey", "Grand Caravan", "RAM 1500", "RAM 2500"],
  "Subaru": ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent", "WRX", "BRZ"],
  "Mitsubishi": ["Mirage", "Outlander", "Eclipse Cross", "Outlander Sport", "Pajero", "L200"],
  "Suzuki": ["Swift", "Vitara", "S-Cross", "Jimny", "Ignis", "Baleno"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40 Recharge", "XC40 Recharge"],
  "Porsche": ["911", "718 Boxster", "718 Cayman", "Panamera", "Macan", "Cayenne", "Taycan"],
  "Ferrari": ["F8 Tributo", "SF90 Stradale", "Roma", "Portofino", "812 Superfast", "296 GTB", "Purosangue"],
  "Lamborghini": ["Huracán", "Aventador", "Urus"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "MC20", "GranTurismo", "GranCabrio"],
  "Bentley": ["Continental GT", "Flying Spur", "Bentayga"],
  "Rolls-Royce": ["Phantom", "Ghost", "Wraith", "Dawn", "Cullinan"],
  "Aston Martin": ["DB11", "DBS Superleggera", "Vantage", "DBX"],
  "Jaguar": ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"],
  "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster"],
  "Autre": []
};

export const BODY_TYPES = [
  "SUV", "Berline", "Pick-up", "Coupé", "Hatchback", 
  "Cabriolet", "Break", "Monospace"
];

export const VEHICLE_CATEGORIES = [
  { value: "economique", label: "Économique" },
  { value: "sportive", label: "Sportive" },
  { value: "awd", label: "AWD" },
  { value: "4x4", label: "4x4" },
  { value: "electrique", label: "Électrique" },
  { value: "petit_camion", label: "Petit camion" }
];

export const POPULAR_CITIES = {
  "CI": ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro"],
  "ML": ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes"],
  "TG": ["Lomé", "Sokodé", "Kara", "Atakpamé", "Kpalimé"],
  "SN": ["Dakar", "Thiès", "Kaolack", "Ziguinchor", "Saint-Louis"],
  "BJ": ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Bohicon"],
  "BF": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"],
  "NE": ["Niamey", "Zinder", "Maradi", "Agadez", "Tahoua"],
  "GN": ["Conakry", "Nzérékoré", "Kankan", "Kindia", "Labé"]
};

export const AVAILABLE_DOCUMENTS = [
  "Carte grise", "Certificat de dédouanement", "Assurance valide",
  "Contrôle technique", "Carnet d'entretien", "Factures d'achat",
  "Certificat de non-gage", "Manuel d'utilisation"
];
