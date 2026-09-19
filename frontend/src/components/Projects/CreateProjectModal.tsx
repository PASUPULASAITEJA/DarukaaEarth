import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { SearchableSelect, SelectOption } from '../UI/SearchableSelect';
import { ProjectCreateInput, ProjectType, ProjectStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projects';

interface CountryData {
  name: string;
  flag: string;
  badge: string;
  regions: string[];
}

const GLOBAL_COUNTRIES_DATA: CountryData[] = [
  {
    name: 'India',
    flag: '🇮🇳',
    badge: '28 States • 8 UTs',
    regions: [
      // 28 States (Alphabetical)
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      // 8 Union Territories
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi (NCT)',
      'Jammu and Kashmir',
      'Ladakh',
      'Lakshadweep',
      'Puducherry',
    ],
  },
  {
    name: 'United States',
    flag: '🇺🇸',
    badge: '50 States • Territories',
    regions: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
      'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
      'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
      'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'Washington D.C.', 'West Virginia', 'Wisconsin', 'Wyoming',
      'Puerto Rico', 'Guam', 'U.S. Virgin Islands'
    ],
  },
  {
    name: 'Brazil',
    flag: '🇧🇷',
    badge: '26 States • Federal District',
    regions: [
      'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal (Brasília)',
      'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais',
      'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte',
      'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
    ],
  },
  {
    name: 'Australia',
    flag: '🇦🇺',
    badge: '6 States • 2 Territories',
    regions: [
      'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
      'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
    ],
  },
  {
    name: 'Canada',
    flag: '🇨🇦',
    badge: '10 Provinces • 3 Territories',
    regions: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
  },
  {
    name: 'United Kingdom',
    flag: '🇬🇧',
    badge: '4 Nations • Crown Territories',
    regions: [
      'England', 'Scotland', 'Wales', 'Northern Ireland', 'Highlands & Islands',
      'Channel Islands', 'Isle of Man'
    ],
  },
  {
    name: 'Indonesia',
    flag: '🇮🇩',
    badge: '38 Provinces',
    regions: [
      'Aceh', 'Bali', 'Banten', 'Bengkulu', 'Central Java', 'Central Kalimantan', 'Central Papua',
      'Central Sulawesi', 'East Java', 'East Kalimantan', 'East Nusa Tenggara', 'Gorontalo',
      'Highland Papua', 'Jakarta (DKI)', 'Jambi', 'Lampung', 'Maluku', 'North Kalimantan',
      'North Maluku', 'North Sulawesi', 'North Sumatra', 'Papua', 'Riau', 'Riau Islands',
      'South East Sulawesi', 'South Kalimantan', 'South Papua', 'South Sulawesi', 'South Sumatra',
      'Southwest Papua', 'West Java', 'West Kalimantan', 'West Nusa Tenggara', 'West Papua',
      'West Sulawesi', 'West Sumatra', 'Yogyakarta'
    ],
  },
  {
    name: 'Germany',
    flag: '🇩🇪',
    badge: '16 States (Bundesländer)',
    regions: [
      'Baden-Württemberg', 'Bavaria (Bayern)', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
      'Hesse (Hessen)', 'Lower Saxony (Niedersachsen)', 'Mecklenburg-Vorpommern',
      'North Rhine-Westphalia (NRW)', 'Rhineland-Palatinate (Rheinland-Pfalz)', 'Saarland',
      'Saxony (Sachsen)', 'Saxony-Anhalt (Sachsen-Anhalt)', 'Schleswig-Holstein', 'Thuringia (Thüringen)'
    ],
  },
  {
    name: 'South Africa',
    flag: '🇿🇦',
    badge: '9 Provinces',
    regions: [
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga',
      'Northern Cape', 'North West', 'Western Cape'
    ],
  },
  {
    name: 'Mexico',
    flag: '🇲🇽',
    badge: '32 States',
    regions: [
      'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
      'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City (CDMX)',
      'Mexico State (Edomex)', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
      'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
      'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
    ],
  },
  {
    name: 'Colombia',
    flag: '🇨🇴',
    badge: '32 Departments',
    regions: [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
      'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
      'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
      'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
      'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá D.C.'
    ],
  },
  {
    name: 'Peru',
    flag: '🇵🇪',
    badge: '25 Regions',
    regions: [
      'Amazonas', 'Ancash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco',
      'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto',
      'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
    ],
  },
  {
    name: 'Kenya',
    flag: '🇰🇪',
    badge: 'Counties / Regions',
    regions: [
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
      'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
      'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
      'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Muranga', 'Nairobi', 'Nakuru', 'Nandi',
      'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta',
      'Tana River', 'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
    ],
  },
  {
    name: 'Democratic Republic of Congo',
    flag: '🇨🇩',
    badge: '26 Provinces',
    regions: [
      'Bas-Uélé', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uélé', 'Ituri', 'Kasaï',
      'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu',
      'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi',
      'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
    ],
  },
  {
    name: 'Costa Rica',
    flag: '🇨🇷',
    badge: '7 Provinces',
    regions: [
      'Alajuela', 'Cartago', 'Guanacaste', 'Heredia', 'Limón', 'Puntarenas', 'San José'
    ],
  },
  {
    name: 'Madagascar',
    flag: '🇲🇬',
    badge: '23 Regions',
    regions: [
      'Alaotra-Mangoro', 'Amoron\'i Mania', 'Analamanga', 'Analanjirofo', 'Androy', 'Anosy',
      'Atsimo-Andrefana', 'Atsimo-Atsinanana', 'Atsinanana', 'Betsiboka', 'Boeny', 'Bongolava',
      'Diana', 'Fitovinany', 'Ihorombe', 'Itasy', 'Matsiatra Ambony', 'Melaky', 'Menabe',
      'Sava', 'Sofia', 'Vakinankaratra', 'Vatovavy'
    ],
  },
  {
    name: 'Ecuador',
    flag: '🇪🇨',
    badge: '24 Provinces',
    regions: [
      'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
      'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona-Santiago',
      'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
      'Sucumbíos', 'Tungurahua', 'Zamora-Chinchipe'
    ],
  },
  {
    name: 'Vietnam',
    flag: '🇻🇳',
    badge: 'Key Regions & Deltas',
    regions: [
      'Mekong River Delta', 'Red River Delta', 'North Central Coast', 'South Central Coast',
      'Central Highlands (Tây Nguyên)', 'Southeast Region (Đông Nam Bộ)', 'Northeast Region', 'Northwest Region'
    ],
  },
  {
    name: 'Tanzania',
    flag: '🇹🇿',
    badge: '31 Regions',
    regions: [
      'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma',
      'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza',
      'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga',
      'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar Central/South',
      'Zanzibar North', 'Zanzibar Urban/West'
    ],
  },
  {
    name: 'Nepal',
    flag: '🇳🇵',
    badge: '7 Provinces',
    regions: [
      'Koshi Province', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province',
      'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'
    ],
  },
  {
    name: 'Malaysia',
    flag: '🇲🇾',
    badge: '13 States • 3 Fed Terr',
    regions: [
      'Johor', 'Kedah', 'Kelantan', 'Malacca (Melaka)', 'Negeri Sembilan', 'Pahang',
      'Penang (Pulau Pinang)', 'Perak', 'Perlis', 'Sabah (Borneo)', 'Sarawak (Borneo)',
      'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
    ],
  },
  {
    name: 'Philippines',
    flag: '🇵🇭',
    badge: '17 Regions',
    regions: [
      'National Capital Region (Metro Manila)', 'Cordillera Administrative Region (CAR)',
      'Ilocos Region (Region I)', 'Cagayan Valley (Region II)', 'Central Luzon (Region III)',
      'CALABARZON (Region IV-A)', 'MIMAROPA (Region IV-B - Palawan)', 'Bicol Region (Region V)',
      'Western Visayas (Region VI)', 'Central Visayas (Region VII)', 'Eastern Visayas (Region VIII)',
      'Zamboanga Peninsula (Region IX)', 'Northern Mindanao (Region X)', 'Davao Region (Region XI)',
      'SOCCSKSARGEN (Region XII)', 'Caraga (Region XIII)', 'Bangsamoro (BARMM)'
    ],
  },
  {
    name: 'Norway',
    flag: '🇳🇴',
    badge: '15 Counties (Fylker)',
    regions: [
      'Agder', 'Akershus', 'Buskerud', 'Finnmark', 'Innlandet', 'Møre og Romsdal',
      'Nordland', 'Oslo', 'Rogaland', 'Telemark', 'Troms', 'Trøndelag',
      'Vestfold', 'Vestland', 'Østfold', 'Svalbard'
    ],
  },
  {
    name: 'Other / International',
    flag: '🌐',
    badge: 'Global Jurisdictions',
    regions: [
      'National Territory', 'Transboundary Wildlife Corridor', 'High-Seas Marine Protected Area',
      'Ramsar Wetland Site', 'UNESCO Biosphere Reserve', 'Indigenous Protected Territory', 'Custom Conservation Zone'
    ],
  },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProjectCreateInput>({
    name: '',
    description: '',
    project_type: 'Carbon',
    status: 'Active',
    start_date: new Date().toISOString().split('T')[0],
    country: '',
    region: '',
  });

  const selectedCountryObj = GLOBAL_COUNTRIES_DATA.find((c) => c.name === formData.country);

  const countryOptions: SelectOption[] = GLOBAL_COUNTRIES_DATA.map((c) => ({
    value: c.name,
    label: c.name,
    icon: c.flag,
    badge: c.badge,
  }));

  const regionOptions: SelectOption[] = selectedCountryObj
    ? selectedCountryObj.regions.map((r) => ({
        value: r,
        label: r,
        icon: '📍',
      }))
    : [];

  const handleCountryChange = (selectedCountry: string) => {
    const countryData = GLOBAL_COUNTRIES_DATA.find((c) => c.name === selectedCountry);
    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
      region: countryData && countryData.regions.length > 0 ? countryData.regions[0] : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Project name is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await projectService.createProject(formData);
      showToast('Project created successfully!', 'success');
      onProjectCreated();
      onClose();
      setFormData({
        name: '',
        description: '',
        project_type: 'Carbon',
        status: 'Active',
        start_date: new Date().toISOString().split('T')[0],
        country: '',
        region: '',
      });
    } catch (err: any) {
      showToast(
        err.response?.data?.detail || 'Failed to create project. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Environmental Project"
      subtitle="Register a new carbon or biodiversity preservation initiative"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Project Name <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Amazonian Rainforest Canopy Conservation"
            className="w-full bg-[#0d171a] border border-[#1e333a] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Type
            </label>
            <select
              value={formData.project_type}
              onChange={(e) =>
                setFormData({ ...formData, project_type: e.target.value as ProjectType })
              }
              className="w-full bg-[#0d171a] border border-[#1e333a] rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Carbon">Carbon Sequestration</option>
              <option value="Biodiversity">Biodiversity Habitat</option>
              <option value="Carbon & Biodiversity">Carbon & Biodiversity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ProjectStatus })
              }
              className="w-full bg-[#0d171a] border border-[#1e333a] rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Rich Country & Region Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableSelect
            label="Country / Jurisdiction"
            value={formData.country}
            onChange={handleCountryChange}
            options={countryOptions}
            placeholder="Search & select country..."
          />

          <SearchableSelect
            label="State / Province / Region"
            value={formData.region}
            onChange={(val) => setFormData({ ...formData, region: val })}
            options={regionOptions}
            placeholder="Search & select state/province..."
            disabled={!formData.country}
            disabledPlaceholder="Select country first..."
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full bg-[#0d171a] border border-[#1e333a] rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the environmental objectives, ecological biome, or methodology..."
            className="w-full bg-[#0d171a] border border-[#1e333a] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#1e333a] flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

