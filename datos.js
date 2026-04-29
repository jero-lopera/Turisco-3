// =============================================
//  TURISCO - datos.js
//  32 DEPARTAMENTOS DE COLOMBIA
//  =============================================

const DEPARTAMENTOS = [
  {
    id: 1,
    nombre: "Amazonas",
    capital: "Leticia",
    región: "Selva Amazónica",
    municipios: [
      {
        nombre: "Leticia",
        lat: -4.2156,
        lon: -69.9494,
        clima: "tropical",
        actividades: ["Selva", "Río Amazonas", "Naturaleza", "Aventura"],
        precioPromedio: 220000,
        atraccionesTop: ["Parque Tayrona", "Comunidades indígenas", "Isla de Micos"]
      },
      {
        nombre: "Puerto Nariño",
        lat: -3.8231,
        lon: -70.3688,
        clima: "tropical",
        actividades: ["Selva", "Río", "Naturaleza"],
        precioPromedio: 200000,
        atraccionesTop: ["Reserva Tanimboca", "Delfines rosados"]
      }
    ]
  },
  {
    id: 2,
    nombre: "Antioquia",
    capital: "Medellín",
    región: "Andes",
    municipios: [
      {
        nombre: "Medellín",
        lat: 6.2186,
        lon: -75.5754,
        clima: "templado",
        actividades: ["Cultura", "Gastronomía", "Arte", "Aventura"],
        precioPromedio: 180000,
        atraccionesTop: ["Plaza Botero", "Comuna 13", "Metro Cable"]
      },
      {
        nombre: "Guatapé",
        lat: 6.2330,
        lon: -75.1643,
        clima: "templado",
        actividades: ["Senderismo", "Lago", "Aventura", "Naturaleza"],
        precioPromedio: 95000,
        atraccionesTop: ["El Peñol", "Lago", "Pueblito"]
      },
      {
        nombre: "Santa Fe de Antioquia",
        lat: 6.5589,
        lon: -75.8158,
        clima: "cálido",
        actividades: ["Historia", "Gastronomía", "Cultura"],
        precioPromedio: 120000,
        atraccionesTop: ["Puente de Occidente", "Centro histórico"]
      }
    ]
  },
  {
    id: 3,
    nombre: "Arauca",
    capital: "Arauca",
    región: "Llanos",
    municipios: [
      {
        nombre: "Arauca",
        lat: 7.0768,
        lon: -70.7505,
        clima: "cálido",
        actividades: ["Naturaleza", "Ganadería", "Aventura"],
        precioPromedio: 100000,
        atraccionesTop: ["Río Arauca", "Llanuras"]
      }
    ]
  },
  {
    id: 4,
    nombre: "Atlántico",
    capital: "Barranquilla",
    región: "Caribe",
    municipios: [
      {
        nombre: "Barranquilla",
        lat: 10.9639,
        lon: -74.7964,
        clima: "cálido",
        actividades: ["Playa", "Carnaval", "Gastronomía", "Cultura"],
        precioPromedio: 150000,
        atraccionesTop: ["Carnaval de Barranquilla", "Museo del Caribe"]
      }
    ]
  },
  {
    id: 5,
    nombre: "Bolívar",
    capital: "Cartagena",
    región: "Caribe",
    municipios: [
      {
        nombre: "Cartagena de Indias",
        lat: 10.3910,
        lon: -75.5139,
        clima: "cálido",
        actividades: ["Playa", "Historia", "Gastronomía", "Cultura"],
        precioPromedio: 450000,
        atraccionesTop: ["Centro Histórico", "Islas del Rosario", "Castillo San Felipe"]
      },
      {
        nombre: "Galerazamba",
        lat: 10.5230,
        lon: -75.3852,
        clima: "cálido",
        actividades: ["Playa", "Lodo termal", "Aventura"],
        precioPromedio: 80000,
        atraccionesTop: ["Volcán de lodo", "Playas"]
      }
    ]
  },
  {
    id: 6,
    nombre: "Boyacá",
    capital: "Tunja",
    región: "Andes",
    municipios: [
      {
        nombre: "Villa de Leyva",
        lat: 5.6349,
        lon: -73.5300,
        clima: "frío",
        actividades: ["Senderismo", "Gastronomía", "Cultura", "Naturaleza"],
        precioPromedio: 150000,
        atraccionesTop: ["Plaza Mayor", "Peñas Blancas", "Pozos azules"]
      },
      {
        nombre: "Tunja",
        lat: 5.5261,
        lon: -73.3639,
        clima: "frío",
        actividades: ["Cultura", "Historia", "Gastronomía"],
        precioPromedio: 100000,
        atraccionesTop: ["Catedral", "Museo Boyacá"]
      }
    ]
  },
  {
    id: 7,
    nombre: "Caldas",
    capital: "Manizales",
    región: "Eje Cafetero",
    municipios: [
      {
        nombre: "Manizales",
        lat: 5.0688,
        lon: -75.5149,
        clima: "templado",
        actividades: ["Café", "Senderismo", "Cultura"],
        precioPromedio: 120000,
        atraccionesTop: ["Feria de Manizales", "Nevado del Ruiz", "Cafeterales"]
      },
      {
        nombre: "Chinchiná",
        lat: 5.0204,
        lon: -75.6133,
        clima: "templado",
        actividades: ["Café", "Naturaleza"],
        precioPromedio: 90000,
        atraccionesTop: ["Cafeterales", "Cascadas"]
      }
    ]
  },
  {
    id: 8,
    nombre: "Caquetá",
    capital: "Florencia",
    región: "Amazonia",
    municipios: [
      {
        nombre: "Florencia",
        lat: 1.6144,
        lon: -75.6055,
        clima: "tropical",
        actividades: ["Selva", "Naturaleza", "Aventura"],
        precioPromedio: 110000,
        atraccionesTop: ["Río Magdalena", "Bosques tropicales"]
      }
    ]
  },
  {
    id: 9,
    nombre: "Casanare",
    capital: "Yopal",
    región: "Llanos",
    municipios: [
      {
        nombre: "Yopal",
        lat: 5.3627,
        lon: -71.2327,
        clima: "cálido",
        actividades: ["Llanuras", "Naturaleza", "Ganadería"],
        precioPromedio: 80000,
        atraccionesTop: ["Llanuras de Casanare"]
      }
    ]
  },
  {
    id: 10,
    nombre: "Cauca",
    capital: "Popayán",
    región: "Pacífico",
    municipios: [
      {
        nombre: "Popayán",
        lat: 2.4448,
        lon: -76.6142,
        clima: "templado",
        actividades: ["Cultura", "Historia", "Gastronomía", "Semana Santa"],
        precioPromedio: 130000,
        atraccionesTop: ["Semana Santa", "Centro histórico", "Iglesias coloniales"]
      }
    ]
  },
  {
    id: 11,
    nombre: "Cesar",
    capital: "Valledupar",
    región: "Caribe",
    municipios: [
      {
        nombre: "Valledupar",
        lat: 10.4639,
        lon: -73.2534,
        clima: "cálido",
        actividades: ["Música", "Cultura", "Gastronomía"],
        precioPromedio: 110000,
        atraccionesTop: ["Festival Vallenato", "Monumento a los Fundadores"]
      }
    ]
  },
  {
    id: 12,
    nombre: "Chocó",
    capital: "Quibdó",
    región: "Pacífico",
    municipios: [
      {
        nombre: "Quibdó",
        lat: 5.6969,
        lon: -76.6558,
        clima: "tropical",
        actividades: ["Selva", "Naturaleza", "Aventura"],
        precioPromedio: 140000,
        atraccionesTop: ["Selva tropical", "Ríos"]
      }
    ]
  },
  {
    id: 13,
    nombre: "Córdoba",
    capital: "Montería",
    región: "Caribe",
    municipios: [
      {
        nombre: "Montería",
        lat: 8.7639,
        lon: -75.8897,
        clima: "cálido",
        actividades: ["Playa", "Gastronomía", "Naturaleza"],
        precioPromedio: 100000,
        atraccionesTop: ["Río Sinú", "Playas"]
      }
    ]
  },
  {
    id: 14,
    nombre: "Cundinamarca",
    capital: "Bogotá",
    región: "Andes",
    municipios: [
      {
        nombre: "Bogotá",
        lat: 4.7110,
        lon: -74.0721,
        clima: "frío",
        actividades: ["Cultura", "Gastronomía", "Historia", "Arte"],
        precioPromedio: 200000,
        atraccionesTop: ["Museo del Oro", "Monserrate", "La Candelaria"]
      },
      {
        nombre: "Zipaquirá",
        lat: 5.0264,
        lon: -73.9900,
        clima: "frío",
        actividades: ["Senderismo", "Minas", "Cultura"],
        precioPromedio: 80000,
        atraccionesTop: ["Catedral de Sal", "Laguna de Iguaque"]
      }
    ]
  },
  {
    id: 15,
    nombre: "Guainía",
    capital: "Inírida",
    región: "Amazonia",
    municipios: [
      {
        nombre: "Inírida",
        lat: 3.8667,
        lon: -67.9167,
        clima: "tropical",
        actividades: ["Selva", "Río", "Aventura"],
        precioPromedio: 250000,
        atraccionesTop: ["Río Inírida", "Comunidades indígenas"]
      }
    ]
  },
  {
    id: 16,
    nombre: "Guaviare",
    capital: "San José del Guaviare",
    región: "Amazonia",
    municipios: [
      {
        nombre: "San José del Guaviare",
        lat: 2.5667,
        lon: -72.6333,
        clima: "tropical",
        actividades: ["Selva", "Naturaleza", "Aventura"],
        precioPromedio: 120000,
        atraccionesTop: ["Caño Cristales", "Selva"]
      }
    ]
  },
  {
    id: 17,
    nombre: "Huila",
    capital: "Neiva",
    región: "Sur",
    municipios: [
      {
        nombre: "Neiva",
        lat: 2.9271,
        lon: -75.2898,
        clima: "cálido",
        actividades: ["Gastronomía", "Naturaleza", "Aventura"],
        precioPromedio: 90000,
        atraccionesTop: ["Festival de la Vaca", "Río Magdalena"]
      },
      {
        nombre: "San Agustín",
        lat: 1.8854,
        lon: -76.2636,
        clima: "templado",
        actividades: ["Arqueología", "Senderismo", "Cultura"],
        precioPromedio: 100000,
        atraccionesTop: ["Parque Arqueológico", "Estatuas megalíticas"]
      }
    ]
  },
  {
    id: 18,
    nombre: "La Guajira",
    capital: "Riohacha",
    región: "Caribe",
    municipios: [
      {
        nombre: "Riohacha",
        lat: 11.5456,
        lon: -72.9211,
        clima: "seco",
        actividades: ["Playa", "Desierto", "Gastronomía", "Cultura wayuu"],
        precioPromedio: 140000,
        atraccionesTop: ["Playas", "Cultura wayuu"]
      },
      {
        nombre: "Uribia",
        lat: 11.8833,
        lon: -72.3000,
        clima: "seco",
        actividades: ["Desierto", "Naturaleza", "Cultura wayuu"],
        precioPromedio: 120000,
        atraccionesTop: ["Punta Gallinas", "Cabo de la Vela"]
      }
    ]
  },
  {
    id: 19,
    nombre: "Magdalena",
    capital: "Santa Marta",
    región: "Caribe",
    municipios: [
      {
        nombre: "Santa Marta",
        lat: 11.2439,
        lon: -74.2247,
        clima: "cálido",
        actividades: ["Playa", "Senderismo", "Gastronomía", "Aventura"],
        precioPromedio: 180000,
        atraccionesTop: ["Ciudad Perdida", "Sierra Nevada", "Playas"]
      },
      {
        nombre: "Tayrona",
        lat: 11.3125,
        lon: -74.0583,
        clima: "tropical",
        actividades: ["Playa", "Senderismo", "Naturaleza"],
        precioPromedio: 150000,
        atraccionesTop: ["Parque Tayrona", "Playas vírgenes"]
      }
    ]
  },
  {
    id: 20,
    nombre: "Meta",
    capital: "Villavicencio",
    región: "Llanos",
    municipios: [
      {
        nombre: "Villavicencio",
        lat: 4.1431,
        lon: -73.6253,
        clima: "cálido",
        actividades: ["Llanuras", "Gastronomía", "Naturaleza"],
        precioPromedio: 110000,
        atraccionesTop: ["Llanuras", "Ganadería", "Naturaleza"]
      }
    ]
  },
  {
    id: 21,
    nombre: "Nariño",
    capital: "Pasto",
    región: "Sur",
    municipios: [
      {
        nombre: "Pasto",
        lat: 1.2136,
        lon: -77.2812,
        clima: "frío",
        actividades: ["Cultura", "Gastronomía", "Carnaval de Negros y Blancos"],
        precioPromedio: 100000,
        atraccionesTop: ["Carnaval de Negros y Blancos", "Laguna de La Cocha"]
      },
      {
        nombre: "Ipiales",
        lat: 1.0721,
        lon: -76.8264,
        clima: "frío",
        actividades: ["Senderismo", "Religión", "Cultura"],
        precioPromedio: 85000,
        atraccionesTop: ["Santuario de Las Lajas"]
      }
    ]
  },
  {
    id: 22,
    nombre: "Norte de Santander",
    capital: "Cúcuta",
    región: "Andes",
    municipios: [
      {
        nombre: "Cúcuta",
        lat: 7.8909,
        lon: -72.5078,
        clima: "cálido",
        actividades: ["Comercio", "Gastronomía", "Aventura"],
        precioPromedio: 95000,
        atraccionesTop: ["Puente Simón Bolívar"]
      }
    ]
  },
  {
    id: 23,
    nombre: "Putumayo",
    capital: "Mocoa",
    región: "Amazonia",
    municipios: [
      {
        nombre: "Mocoa",
        lat: 1.1489,
        lon: -76.6446,
        clima: "tropical",
        actividades: ["Selva", "Cascadas", "Naturaleza", "Aventura"],
        precioPromedio: 130000,
        atraccionesTop: ["Cascadas de San Rafael", "Senderos en la selva"]
      }
    ]
  },
  {
    id: 24,
    nombre: "Quindío",
    capital: "Armenia",
    región: "Eje Cafetero",
    municipios: [
      {
        nombre: "Armenia",
        lat: 4.5339,
        lon: -75.6891,
        clima: "templado",
        actividades: ["Café", "Gastronomía", "Cultura"],
        precioPromedio: 100000,
        atraccionesTop: ["Parque del Café", "Paisaje Cafetero"]
      },
      {
        nombre: "Salento",
        lat: 4.6500,
        lon: -75.5642,
        clima: "templado",
        actividades: ["Café", "Senderismo", "Naturaleza"],
        precioPromedio: 110000,
        atraccionesTop: ["Valle de Cocora", "Cafeterales"]
      }
    ]
  },
  {
    id: 25,
    nombre: "Risaralda",
    capital: "Pereira",
    región: "Eje Cafetero",
    municipios: [
      {
        nombre: "Pereira",
        lat: 4.8133,
        lon: -75.6964,
        clima: "templado",
        actividades: ["Café", "Gastronomía", "Cultura", "Aventura"],
        precioPromedio: 100000,
        atraccionesTop: ["Eje Cafetero", "Parque Bolívar"]
      }
    ]
  },
  {
    id: 26,
    nombre: "Santander",
    capital: "Bucaramanga",
    región: "Andes",
    municipios: [
      {
        nombre: "Bucaramanga",
        lat: 7.1256,
        lon: -73.1198,
        clima: "templado",
        actividades: ["Gastronomía", "Aventura", "Naturaleza"],
        precioPromedio: 120000,
        atraccionesTop: ["Parque del Chicamocha", "Giralda"]
      },
      {
        nombre: "San Gil",
        lat: 6.2972,
        lon: -73.1458,
        clima: "templado",
        actividades: ["Aventura", "Senderismo", "Canotaje"],
        precioPromedio: 90000,
        atraccionesTop: ["Canotaje en Río Fonce", "Cascadas"]
      }
    ]
  },
  {
    id: 27,
    nombre: "Sucre",
    capital: "Sincelejo",
    región: "Caribe",
    municipios: [
      {
        nombre: "Sincelejo",
        lat: 9.3089,
        lon: -75.3972,
        clima: "cálido",
        actividades: ["Gastronomía", "Música", "Cultura"],
        precioPromedio: 100000,
        atraccionesTop: ["Corralejas"]
      }
    ]
  },
  {
    id: 28,
    nombre: "Tolima",
    capital: "Ibagué",
    región: "Andes",
    municipios: [
      {
        nombre: "Ibagué",
        lat: 4.4308,
        lon: -75.2327,
        clima: "templado",
        actividades: ["Música", "Gastronomía", "Cultura"],
        precioPromedio: 100000,
        atraccionesTop: ["Conservatorio del Tolima", "Musica"]
      }
    ]
  },
  {
    id: 29,
    nombre: "Valle del Cauca",
    capital: "Cali",
    región: "Pacífico",
    municipios: [
      {
        nombre: "Cali",
        lat: 3.4372,
        lon: -76.5197,
        clima: "cálido",
        actividades: ["Salsa", "Gastronomía", "Vida nocturna", "Cultura"],
        precioPromedio: 140000,
        atraccionesTop: ["Festival de Salsa", "Cristo Rey", "San Antonio"]
      }
    ]
  },
  {
    id: 30,
    nombre: "Vaupés",
    capital: "Mitú",
    región: "Amazonia",
    municipios: [
      {
        nombre: "Mitú",
        lat: 1.1986,
        lon: -70.8067,
        clima: "tropical",
        actividades: ["Selva", "Naturaleza", "Aventura"],
        precioPromedio: 200000,
        atraccionesTop: ["Río Vaupés", "Comunidades indígenas"]
      }
    ]
  },
  {
    id: 31,
    nombre: "Vichada",
    capital: "Puerto Carreño",
    región: "Llanos",
    municipios: [
      {
        nombre: "Puerto Carreño",
        lat: 6.1833,
        lon: -67.5000,
        clima: "cálido",
        actividades: ["Llanuras", "Naturaleza", "Aventura"],
        precioPromedio: 180000,
        atraccionesTop: ["Confluencia de ríos"]
      }
    ]
  },
  {
    id: 32,
    nombre: "Archipiélago de San Andrés, Providencia y Santa Catalina",
    capital: "San Andrés",
    región: "Caribe Insular",
    municipios: [
      {
        nombre: "San Andrés",
        lat: 12.5847,
        lon: -81.7006,
        clima: "tropical",
        actividades: ["Playa", "Buceo", "Gastronomía", "Aventura"],
        precioPromedio: 250000,
        atraccionesTop: ["Playas de arena blanca", "Buceo en arrecifes", "Old Providence"]
      },
      {
        nombre: "Providencia",
        lat: 13.3833,
        lon: -81.3833,
        clima: "tropical",
        actividades: ["Playa", "Buceo", "Naturaleza"],
        precioPromedio: 200000,
        atraccionesTop: ["Cayo Cangrejo", "Playas vírgenes"]
      }
    ]
  }
];

// =============================================
// OBJETO DE BÚSQUEDA RÁPIDA
// =============================================

// Crear un mapa para búsqueda rápida por nombre
const mapaDepartamentos = {};
const mapaMunicipios = {};

DEPARTAMENTOS.forEach(dept => {
  mapaDepartamentos[dept.nombre.toLowerCase()] = dept;
  dept.municipios.forEach(mun => {
    mapaMunicipios[mun.nombre.toLowerCase()] = {
      departamento: dept.nombre,
      municipio: mun
    };
  });
});

// =============================================
// TIPOS DE VIAJERO
// =============================================

const TIPOS_VIAJERO = {
  solo: {
    nombre: "Viajero Solo",
    emoji: "🧑‍🤝‍🧑",
    descripcion: "Aventuras independientes",
    actividades: ["Senderismo", "Aventura", "Naturaleza"]
  },
  pareja: {
    nombre: "Pareja",
    emoji: "👫",
    descripcion: "Romántico y relajante",
    actividades: ["Playa", "Gastronomía", "Cultura"]
  },
  familia: {
    nombre: "Familia",
    emoji: "👨‍👩‍👧‍👦",
    descripcion: "Actividades para todos",
    actividades: ["Playa", "Naturaleza", "Cultura"]
  },
  amigos: {
    nombre: "Grupo de Amigos",
    emoji: "👯",
    descripcion: "Diversión y aventura",
    actividades: ["Aventura", "Gastronomía", "Vida nocturna"]
  },
  mochilero: {
    nombre: "Mochilero",
    emoji: "🎒",
    descripcion: "Economía y aventura",
    actividades: ["Senderismo", "Aventura", "Naturaleza"]
  }
};

// =============================================
// RANGOS DE PRESUPUESTO
// =============================================

const PRESUPUESTOS = [
  { min: 50000, max: 150000, label: "Económico 💰", color: "#1D9E75" },
  { min: 150000, max: 350000, label: "Intermedio 💳", color: "#EF9F27" },
  { min: 350000, max: 1000000, label: "Lujo ✨", color: "#085041" }
];

// =============================================
// CLIMAS Y ESTACIONES
// =============================================

const CLIMAS = {
  soleado: { emoji: "☀️", color: "#FFD700" },
  nublado: { emoji: "🌤", color: "#A9A9A9" },
  lluvioso: { emoji: "🌧", color: "#4169E1" },
  cálido: { emoji: "🔥", color: "#FF4500" },
  frío: { emoji: "❄️", color: "#00BFFF" },
  tropical: { emoji: "🌴", color: "#228B22" },
  templado: { emoji: "🌤", color: "#87CEEB" },
  seco: { emoji: "🏜", color: "#DAA520" }
};
