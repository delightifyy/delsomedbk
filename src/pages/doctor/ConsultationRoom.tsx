import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { normalizeAppointment, type DoctorPortalAppointment } from "@/lib/doctorPortalApi";
import {
  ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Plus, Trash2,
  Save, Send, Download, Check, Loader2, FileText, Move, Minimize2, Maximize2,
  X, Pill, FlaskConical, Stethoscope, User, Calendar, Clock, Phone, MapPin, Mail,
  File, FileCheck, PenSquare, Upload, Signature, LayoutGrid, AlignJustify, AlertCircle,
  Activity, Microscope, Scissors, Scan
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock patient data for auto-population
const mockPatientData = {
  id: "P001",
  name: "Adaobi Okeke",
  age: 33,
  gender: "Female",
  dob: "1993-03-15",
  phone: "+234 802 345 6789",
  email: "adaobi.okeke@email.com",
  address: "12 Awolowo Road, Ikoyi, Lagos",
  patientId: "123456789",
  mhsc: "987654321",
  emergencyContact: "+234 803 456 7890",
  allergies: ["Penicillin", "Peanuts"],
  currentMedications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
    { name: "Vitamin D3", dosage: "2000 IU", frequency: "daily" }
  ],
  medicalHistory: ["Hypertension (2024)", "Mild asthma (childhood)"],
  previousConsultations: [
    { date: "Apr 28", specialty: "Cardiology" },
    { date: "Mar 12", specialty: "Wellness" },
    { date: "Jan 09", specialty: "Sinusitis" }
  ]
};

const mockDoctorData = {
  name: "Dr. Chinedu Okafor",
  specialty: "Consultant Cardiologist",
  license: "MDCN/2014/45821",
  hospital: "Desolmed Medical Centre",
  phone: "+234 802 345 6789",
  email: "chinedu.okafor@desolmed.com",
  address: "12 Awolowo Road, Ikoyi, Lagos",
  signature: "Dr. C. Okafor"
};

// Comprehensive drug categories with dosage forms and routes
const drugCategories = {
  "Analgesics & Antipyretics": [
    "Paracetamol", "Aspirin", "Ibuprofen", "Diclofenac", "Naproxen", "Mefenamic Acid",
    "Ketorolac", "Piroxicam", "Celecoxib", "Etoricoxib", "Indomethacin", "Tramadol",
    "Morphine", "Codeine", "Pethidine", "Fentanyl", "Buprenorphine", "Nalbuphine",
    "Pentazocine"
  ],
  "NSAIDs": [
    "Ibuprofen", "Diclofenac", "Naproxen", "Mefenamic Acid", "Ketorolac", "Piroxicam",
    "Celecoxib", "Etoricoxib", "Indomethacin", "Meloxicam", "Aceclofenac", "Nimesulide"
  ],
  "Opioid Analgesics": [
    "Tramadol", "Morphine", "Codeine", "Pethidine", "Fentanyl", "Buprenorphine",
    "Nalbuphine", "Pentazocine", "Oxycodone", "Hydrocodone", "Methadone"
  ],
  "Anaesthetics": [
    "Lidocaine", "Bupivacaine", "Prilocaine", "Tetracaine", "Benzocaine", "Procaine",
    "Ropivacaine", "Levobupivacaine", "Articaine"
  ],
  "Antibacterials": [
    "Amoxicillin", "Amoxicillin-Clavulanate", "Ampicillin", "Cloxacillin", "Flucloxacillin",
    "Piperacillin-Tazobactam", "Cefalexin", "Cefuroxime", "Ceftriaxone", "Cefotaxime",
    "Ceftazidime", "Cefepime", "Cefixime", "Ceftriaxone", "Meropenem", "Imipenem",
    "Ertapenem", "Gentamicin", "Amikacin", "Tobramycin", "Ciprofloxacin", "Levofloxacin",
    "Moxifloxacin", "Ofloxacin", "Azithromycin", "Clarithromycin", "Erythromycin",
    "Doxycycline", "Minocycline", "Tetracycline", "Clindamycin", "Metronidazole",
    "Vancomycin", "Teicoplanin", "Linezolid", "Rifampicin", "Fusidic Acid", "Cotrimoxazole",
    "Nitrofurantoin", "Fosfomycin", "Chloramphenicol", "Colistin", "Polymyxin B"
  ],
  "Antituberculosis Medicines": [
    "Rifampicin", "Isoniazid", "Pyrazinamide", "Ethambutol", "Streptomycin",
    "Rifabutin", "Rifapentine", "Moxifloxacin", "Levofloxacin", "Bedaquiline",
    "Delamanid", "Pretomanid", "Linezolid", "Clofazimine"
  ],
  "Antifungals": [
    "Fluconazole", "Itraconazole", "Voriconazole", "Posaconazole", "Caspofungin",
    "Micafungin", "Anidulafungin", "Amphotericin B", "Nystatin", "Clotrimazole",
    "Miconazole", "Ketoconazole", "Terbinafine", "Griseofulvin", "Echinocandins"
  ],
  "Antivirals & Antiretrovirals": [
    "Acyclovir", "Valacyclovir", "Famciclovir", "Ganciclovir", "Oseltamivir",
    "Zanamivir", "Remdesivir", "Ribavirin", "Tenofovir", "Emtricitabine", "Lamivudine",
    "Zidovudine", "Abacavir", "Dolutegravir", "Raltegravir", "Efavirenz", "Nevirapine",
    "Ritonavir", "Lopinavir", "Darunavir", "Atazanavir", "Entecavir", "Sofosbuvir",
    "Daclatasvir", "Velpatasvir", "Glecaprevir", "Pibrentasvir"
  ],
  "Antiparasitics & Antimalarials": [
    "Artemether-Lumefantrine", "Artemisinin", "Artesunate", "Dihydroartemisinin",
    "Chloroquine", "Hydroxychloroquine", "Quinine", "Mefloquine", "Primaquine",
    "Proguanil", "Doxycycline", "Atovaquone", "Piperaquine", "Praziquantel", "Albendazole",
    "Mebendazole", "Ivermectin", "Diethylcarbamazine", "Metronidazole", "Tinidazole",
    "Nitazoxanide", "Sulfadoxine-Pyrimethamine"
  ],
  "Cardiovascular Medicines": [
    "Lisinopril", "Enalapril", "Ramipril", "Perindopril", "Losartan", "Valsartan",
    "Candesartan", "Irbesartan", "Amlodipine", "Nifedipine", "Felodipine", "Diltiazem",
    "Verapamil", "Metoprolol", "Atenolol", "Bisoprolol", "Carvedilol", "Propranolol",
    "Furosemide", "Hydrochlorothiazide", "Spironolactone", "Bumetanide", "Torasemide",
    "Digoxin", "Dobutamine", "Dopamine", "Noradrenaline", "Adrenaline", "Nitroglycerin",
    "Isosorbide Dinitrate", "Molsidomine", "Hydralazine", "Prazosin", "Doxazosin",
    "Clonidine", "Methyldopa", "Moxonidine", "Atorvastatin", "Rosuvastatin", "Simvastatin",
    "Pravastatin", "Fenofibrate", "Gemfibrozil", "Ezetimibe", "Aspirin", "Clopidogrel",
    "Ticagrelor", "Prasugrel", "Warfarin", "Apixaban", "Rivaroxaban", "Dabigatran",
    "Edoxaban", "Heparin", "Enoxaparin", "Dalteparin", "Fondaparinux"
  ],
  "Anticoagulants & Haemostasis": [
    "Warfarin", "Apixaban", "Rivaroxaban", "Dabigatran", "Edoxaban", "Heparin",
    "Enoxaparin", "Dalteparin", "Fondaparinux", "Aspirin", "Clopidogrel", "Ticagrelor",
    "Prasugrel", "Dipyridamole", "Cilostazol", "Tranexamic Acid", "Aminocaproic Acid",
    "Vitamin K", "Protamine Sulfate", "Andexanet Alfa", "Idarucizumab"
  ],
  "Diabetes Medicines": [
    "Metformin", "Gliclazide", "Glimepiride", "Glibenclamide", "Pioglitazone",
    "Rosiglitazone", "Sitagliptin", "Vildagliptin", "Saxagliptin", "Linagliptin",
    "Dapagliflozin", "Empagliflozin", "Canagliflozin", "Exenatide", "Liraglutide",
    "Semaglutide", "Dulaglutide", "Insulin Regular", "Insulin NPH", "Insulin Glargine",
    "Insulin Detemir", "Insulin Degludec", "Insulin Lispro", "Insulin Aspart",
    "Insulin Glulisine", "Acarbose", "Miglitol", "Pramlintide"
  ],
  "Endocrine & Corticosteroids": [
    "Prednisone", "Prednisolone", "Methylprednisolone", "Dexamethasone", "Betamethasone",
    "Hydrocortisone", "Cortisone", "Fludrocortisone", "Levothyroxine", "Liothyronine",
    "Carbimazole", "Propylthiouracil", "Methimazole", "Levothyroxine", "Desmopressin",
    "Vasopressin", "Oxytocin", "Somatostatin", "Octreotide", "Lanreotide"
  ],
  "Respiratory Medicines": [
    "Salbutamol", "Terbutaline", "Fenoterol", "Formoterol", "Salmeterol", "Indacaterol",
    "Vilanterol", "Olodaterol", "Ipratropium", "Tiotropium", "Budesonide", "Fluticasone",
    "Beclomethasone", "Mometasone", "Ciclesonide", "Theophylline", "Aminophylline",
    "Montelukast", "Zafirlukast", "Zileuton", "Cromolyn", "Nedocromil", "Omalizumab",
    "Mepolizumab", "Reslizumab", "Benralizumab", "Dupilumab", "Acetylcysteine",
    "Carbocisteine", "Erdosteine", "Dornase Alfa"
  ],
  "Gastrointestinal Medicines": [
    "Omeprazole", "Pantoprazole", "Esomeprazole", "Lansoprazole", "Rabeprazole",
    "Ranitidine", "Famotidine", "Nizatidine", "Sucralfate", "Misoprostol", "Bismuth Subsalicylate",
    "Metoclopramide", "Domperidone", "Ondansetron", "Granisetron", "Palonosetron",
    "Loperamide", "Diphenoxylate", "Budesonide", "Mesalamine", "Sulfasalazine",
    "Olmesartan", "Lactulose", "Polyethylene Glycol", "Senna", "Bisacodyl",
    "Docusate Sodium", "Psyllium", "Alginic Acid", "Simethicone"
  ],
  "Neurology & Antiseizure Medicines": [
    "Phenytoin", "Carbamazepine", "Oxcarbazepine", "Valproic Acid", "Sodium Valproate",
    "Lamotrigine", "Levetiracetam", "Topiramate", "Gabapentin", "Pregabalin",
    "Phenobarbital", "Primidone", "Ethosuximide", "Vigabatrin", "Tiagabine",
    "Zonisamide", "Lacosamide", "Rufinamide", "Perampanel", "Brivaracetam",
    "Levodopa", "Carbidopa", "Bromocriptine", "Pramipexole", "Ropinirole",
    "Selegiline", "Entacapone", "Tolcapone", "Amantadine", "Rivastigmine",
    "Donepezil", "Galantamine", "Memantine", "Tizanidine", "Baclofen", "Diazepam",
    "Clonazepam", "Lorazepam", "Midazolam", "Chloral Hydrate", "Melatonin"
  ],
  "Psychiatry Medicines": [
    "Sertraline", "Fluoxetine", "Paroxetine", "Citalopram", "Escitalopram",
    "Fluvoxamine", "Vortioxetine", "Amitriptyline", "Nortriptyline", "Imipramine",
    "Clomipramine", "Doxepin", "Mirtazapine", "Venlafaxine", "Duloxetine",
    "Desvenlafaxine", "Bupropion", "Trazodone", "Reboxetine", "Moclobemide",
    "Olanzapine", "Risperidone", "Quetiapine", "Aripiprazole", "Clozapine",
    "Ziprasidone", "Paliperidone", "Lurasidone", "Haloperidol", "Chlorpromazine",
    "Lithium", "Carbamazepine", "Valproic Acid", "Lamotrigine", "Diazepam",
    "Alprazolam", "Clonazepam", "Lorazepam", "Oxazepam", "Buspirone",
    "Zopiclone", "Zolpidem", "Eszopiclone", "Ramelteon", "Suvorexant"
  ],
  "Antihistamines & Allergy": [
    "Cetirizine", "Loratadine", "Desloratadine", "Fexofenadine", "Levocetirizine",
    "Bilastine", "Rupatadine", "Chlorpheniramine", "Promethazine", "Hydroxyzine",
    "Cyproheptadine", "Diphenhydramine", "Doxylamine", "Adrenaline", "Ephedrine",
    "Pseudoephedrine", "Cromolyn", "Montelukast", "Omalizumab", "Dupilumab"
  ],
  "Rheumatology & Immunology": [
    "Prednisolone", "Methylprednisolone", "Dexamethasone", "Hydrocortisone",
    "Methotrexate", "Azathioprine", "Mycophenolate Mofetil", "Cyclophosphamide",
    "Cyclosporine", "Tacrolimus", "Leflunomide", "Sulfasalazine", "Hydroxychloroquine",
    "Adalimumab", "Infliximab", "Etanercept", "Certolizumab", "Golimumab",
    "Rituximab", "Tocilizumab", "Abatacept", "Anakinra", "Canakinumab",
    "Ustekinumab", "Secukinumab", "Ixekizumab", "Brodalumab", "Guselkumab",
    "Tofacitinib", "Baricitinib", "Upadacitinib", "Filgotinib", "Colchicine"
  ],
  "Oncology Medicines": [
    "Cyclophosphamide", "Methotrexate", "Fluorouracil", "Doxorubicin", "Daunorubicin",
    "Epirubicin", "Mitoxantrone", "Bleomycin", "Vincristine", "Vinblastine",
    "Paclitaxel", "Docetaxel", "Carboplatin", "Cisplatin", "Oxaliplatin",
    "Etoposide", "Teniposide", "Ifosfamide", "Mesna", "Gemcitabine", "Capecitabine",
    "Temozolomide", "Imatinib", "Dasatinib", "Nilotinib", "Erlotinib", "Gefitinib",
    "Osimertinib", "Crizotinib", "Alectinib", "Bevacizumab", "Trastuzumab",
    "Rituximab", "Cetuximab", "Panitumumab", "Pembrolizumab", "Nivolumab",
    "Ipilimumab", "Durvalumab", "Atezolizumab", "Lenalidomide", "Bortezomib",
    "Thalidomide", "Tamoxifen", "Anastrozole", "Letrozole", "Exemestane",
    "Leuprorelin", "Goserelin", "Flutamide", "Bicalutamide", "Abiraterone"
  ],
  "Obstetrics & Gynaecology": [
    "Oxytocin", "Ergometrine", "Misoprostol", "Prostaglandin E2", "Dinoprostone",
    "Mifepristone", "Medroxyprogesterone", "Norethisterone", "Levonorgestrel",
    "Desogestrel", "Ethinylestradiol", "Drospirenone", "Clomiphene", "Letrozole",
    "Gonadotropins", "FSH", "hCG", "GnRH Agonists", "Danazol", "Tranexamic Acid"
  ],
  "Urology Medicines": [
    "Tamsulosin", "Alfuzosin", "Terazosin", "Doxazosin", "Finasteride",
    "Dutasteride", "Solifenacin", "Darifenacin", "Oxybutynin", "Tolterodine",
    "Trospium", "Fesoterodine", "Mirabegron", "Vibegron", "Sildenafil",
    "Tadalafil", "Vardenafil", "Avanafil", "Desmopressin", "Potassium Citrate"
  ],
  "Ophthalmology Medicines": [
    "Latanoprost", "Bimatoprost", "Travoprost", "Tafluprost", "Timolol",
    "Betaxolol", "Dorzolamide", "Brinzolamide", "Brimonidine", "Apraclonidine",
    "Pilocarpine", "Carbachol", "Atropine", "Cyclopentolate", "Tropicamide",
    "Prednisolone", "Dexamethasone", "Fluorometholone", "Loteprednol", "Ciprofloxacin",
    "Ofloxacin", "Gatifloxacin", "Moxifloxacin", "Gentamicin", "Tobramycin",
    "Azithromycin", "Ceftazidime", "Vancomycin", "Acyclovir", "Ganciclovir"
  ],
  "Dermatology Medicines": [
    "Hydrocortisone", "Betamethasone", "Clobetasol", "Mometasone", "Triamcinolone",
    "Fluocinolone", "Clotrimazole", "Miconazole", "Terbinafine", "Ketoconazole",
    "Econazole", "Sertaconazole", "Acyclovir", "Penciclovir", "Imiquimod",
    "Podophyllotoxin", "Salicylic Acid", "Benzoyl Peroxide", "Adapalene",
    "Tretinoin", "Isotretinoin", "Dapsone", "Azelaic Acid", "Calcipotriol",
    "Tacrolimus", "Pimecrolimus", "Methotrexate", "Acitretin", "Capsaicin"
  ],
  "ENT Medicines": [
    "Amoxicillin", "Amoxicillin-Clavulanate", "Cefuroxime", "Ceftriaxone",
    "Azithromycin", "Clarithromycin", "Fluconazole", "Itraconazole", "Betamethasone",
    "Dexamethasone", "Prednisolone", "Desloratadine", "Cetirizine", "Fexofenadine",
    "Oxymetazoline", "Xylometazoline", "Fluticasone", "Mometasone", "Budesonide"
  ],
  "Fluids, Electrolytes & Nutrition": [
    "Normal Saline (0.9% NaCl)", "Half Normal Saline (0.45% NaCl)", "Dextrose 5%",
    "Dextrose 10%", "Dextrose 25%", "Dextrose 50%", "Ringer's Lactate",
    "Hartmann's Solution", "Sodium Chloride 3%", "Sodium Chloride 7.5%",
    "Potassium Chloride", "Sodium Bicarbonate", "Calcium Gluconate",
    "Magnesium Sulfate", "Phosphate", "Multivitamin Infusion", "Trace Elements"
  ],
  "Vitamins, Minerals & Haematinics": [
    "Vitamin B1 (Thiamine)", "Vitamin B2 (Riboflavin)", "Vitamin B3 (Niacin)",
    "Vitamin B5 (Pantothenic Acid)", "Vitamin B6 (Pyridoxine)", "Vitamin B7 (Biotin)",
    "Vitamin B9 (Folic Acid)", "Vitamin B12 (Cyanocobalamin)", "Vitamin C (Ascorbic Acid)",
    "Vitamin A (Retinol)", "Vitamin D3 (Cholecalciferol)", "Vitamin E (Tocopherol)",
    "Vitamin K1 (Phytomenadione)", "Iron Sulfate", "Iron Fumarate", "Iron Sucrose",
    "Ferric Carboxymaltose", "Ferumoxytol", "Zinc Sulfate", "Zinc Acetate",
    "Selenium", "Copper", "Manganese", "Chromium", "Iodine", "Molybdenum",
    "Calcium Carbonate", "Calcium Citrate", "Calcium Gluconate", "Magnesium Oxide"
  ],
  "Emergency & Critical Care": [
    "Adrenaline", "Noradrenaline", "Dopamine", "Dobutamine", "Vasopressin",
    "Atropine", "Naloxone", "Flumazenil", "Glucagon", "Sodium Bicarbonate",
    "Calcium Chloride", "Magnesium Sulfate", "Amiodarone", "Lidocaine",
    "Adenosine", "Diltiazem", "Esmolol", "Nitroglycerin", "Nitroprusside",
    "Mannitol", "Hypertonic Saline", "Dexamethasone", "Methylprednisolone"
  ],
  "Vaccines & Immunoglobulins": [
    "Diphtheria-Tetanus-Pertussis (DTP)", "Tetanus Toxoid", "Tdap",
    "Measles-Mumps-Rubella (MMR)", "Varicella", "Hepatitis B", "Hepatitis A",
    "Human Papillomavirus (HPV)", "Pneumococcal Conjugate", "Pneumococcal Polysaccharide",
    "Influenza", "COVID-19", "Meningococcal", "BCG", "Rotavirus", "Polio (IPV/OPV)",
    "Rabies", "Yellow Fever", "Cholera", "Typhoid", "Human Rabies Immunoglobulin",
    "Tetanus Immunoglobulin", "Varicella-Zoster Immunoglobulin", "Hepatitis B Immunoglobulin"
  ]
};

// Dosage forms
const dosageForms = [
  "Tablet", "Capsule", "Caplet", "Suspension", "Syrup", "Elixir", "Drops",
  "Injection (IV)", "Injection (IM)", "Injection (SC)", "Infusion",
  "Ointment", "Cream", "Lotion", "Gel", "Topical Solution", "Patch",
  "Inhalation", "Inhaler", "Nebuliser Solution", "Aerosol",
  "Eye Drops", "Ear Drops", "Nasal Drops", "Nasal Spray",
  "Suppository", "Enema", "Vaginal Tablet", "Vaginal Cream",
  "Sublingual Tablet", "Buccal Tablet", "Chewable Tablet",
  "Transdermal Patch", "Implant", "Intrauterine Device",
  "Granules", "Powder", "Effervescent Tablet", "Dispersible Tablet"
];

// Routes of administration
const routesOfAdministration = [
  "Oral", "Intravenous (IV)", "Intramuscular (IM)", "Subcutaneous (SC)",
  "IV/IM", "IV/IM/SC", "Inhalation", "Topical", "Ophthalmic", "Otic",
  "Nasal", "Rectal", "Vaginal", "Sublingual", "Buccal", "Intradermal",
  "Parenteral", "Epidural", "Intrathecal", "Intra-articular", "Intraosseous"
];

// Units
const units = [
  "mg", "g", "mcg", "µg", "mg/ml", "g/ml", "mcg/ml", "IU", "IU/ml",
  "mmol/L", "mEq", "unit", "units/ml", "%", "mg/kg", "mcg/kg",
  "mg/kg/day", "mcg/kg/min", "mg/kg/hr", "unit/kg"
];

const ConsultationRoom = () => {
  const { id } = useParams();
  const fallbackConsult = doctorMock.todaySchedule.find((c) => c.id === id) ?? doctorMock.todaySchedule[0];
  const [currentAppointment, setCurrentAppointment] = useState<DoctorPortalAppointment | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const consult = currentAppointment
    ? {
        id: currentAppointment.appointmentUuid,
        time: currentAppointment.time,
        patient: currentAppointment.patientName,
        reason: currentAppointment.reason,
        status: currentAppointment.status as typeof fallbackConsult.status,
      }
    : fallbackConsult;
  const appointmentUuid = currentAppointment?.appointmentUuid;
  const consultationUuid = currentAppointment?.consultationUuid ?? id;

  // Floating video state
  const [isFloating, setIsFloating] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const floatingRef = useRef<HTMLDivElement>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Clinical notes view mode - 'structured' or 'free'
  const [notesViewMode, setNotesViewMode] = useState<"structured" | "free">("structured");

  // Structured notes data
  const [noteData, setNoteData] = useState({
    pc: "",
    hpc: "",
    medicalSocialHistory: "",
    medicationAllergy: "",
    examination: "",
    investigationResults: "",
    diagnosis: "",
    treatment: "",
    planReferral: ""
  });

  // Free text notes
  const [freeTextNotes, setFreeTextNotes] = useState("");

  // Auto-save state
  const [autoSave, setAutoSave] = useState<"idle" | "saving" | "saved">("idle");

  // Auto-save effect for structured notes
  useEffect(() => {
    const hasContent = Object.values(noteData).some(Boolean);
    if (!hasContent) return;
    setAutoSave("saving");
    const t = setTimeout(() => setAutoSave("saved"), 800);
    return () => clearTimeout(t);
  }, [noteData]);

  // Auto-save effect for free text
  useEffect(() => {
    if (!freeTextNotes) return;
    setAutoSave("saving");
    const t = setTimeout(() => setAutoSave("saved"), 800);
    return () => clearTimeout(t);
  }, [freeTextNotes]);

  // Prescription - Drug selection with categories
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDrug, setSelectedDrug] = useState("");
  const [manualDrug, setManualDrug] = useState("");
  const [meds, setMeds] = useState<{
    id: string;
    name: string;
    dosageForm: string;
    strength: string;
    unit: string;
    route: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      dosageForm: "",
      strength: "",
      unit: "",
      route: "",
      frequency: "",
      duration: "",
      instructions: ""
    },
  ]);
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [refills, setRefills] = useState("0");

  // Doctor signature
  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);

  // Auto-populate patient info
  const [patientInfo, setPatientInfo] = useState({
    lastName: mockPatientData.name.split(" ")[1] || "",
    firstName: mockPatientData.name.split(" ")[0] || "",
    patientId: mockPatientData.patientId,
    mhsc: mockPatientData.mhsc,
    dob: mockPatientData.dob,
    gender: mockPatientData.gender,
    address: mockPatientData.address,
    phone: mockPatientData.phone,
    email: mockPatientData.email,
    emergencyContact: mockPatientData.emergencyContact,
  });

  // Auto-populate doctor info
  const [physicianInfo, setPhysicianInfo] = useState({
    surname: mockDoctorData.name.split(" ")[1] || "",
    firstInitial: mockDoctorData.name.split(" ")[0]?.charAt(0) || "",
    address: mockDoctorData.address,
    phone: mockDoctorData.phone,
    email: mockDoctorData.email,
    afterHoursContact: mockDoctorData.phone,
    ccPhysicianName: "",
    ccAddress: "",
    ccPhone: "",
    ccFax: "",
    specialty: mockDoctorData.specialty,
    license: mockDoctorData.license,
    hospital: mockDoctorData.hospital,
    signature: mockDoctorData.signature,
  });

  useEffect(() => {
    if (!id) return;

    const loadRoom = async () => {
      setRoomLoading(true);
      try {
        const detail = await api.doctorPortal.appointments.detail(id);
        const appointment = normalizeAppointment(detail);
        setCurrentAppointment(appointment);
      } catch {
        try {
          const detail = await api.doctorPortal.consultations.detail(id);
          const data = (detail as any).data ?? detail;
          const appointment = normalizeAppointment((data as any).appointment ?? data);
          setCurrentAppointment({
            ...appointment,
            consultationUuid: appointment.consultationUuid ?? id,
          });
        } catch {
          setCurrentAppointment(null);
        }
      } finally {
        setRoomLoading(false);
      }
    };

    loadRoom();
  }, [id]);

  useEffect(() => {
    if (!currentAppointment) return;
    const [firstName = "", ...rest] = currentAppointment.patientName.split(" ");
    setPatientInfo((current) => ({
      ...current,
      firstName,
      lastName: rest.join(" ") || current.lastName,
      patientId: currentAppointment.patientUuid ?? current.patientId,
      gender: currentAppointment.gender ?? current.gender,
      phone: currentAppointment.patientPhone ?? current.phone,
      email: currentAppointment.patientEmail ?? current.email,
    }));
  }, [currentAppointment]);

  // Payment Agency
  const [paymentAgency, setPaymentAgency] = useState<"MB" | "WCB" | "Other" | "">("");
  const [otherPaymentAgency, setOtherPaymentAgency] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Insurance" | "Bank Transfer" | "">("");
  const [receiptNumber, setReceiptNumber] = useState("");

  // Menthol Allergy
  const [mentholAllergy, setMentholAllergy] = useState(false);
  const [otherAllergies, setOtherAllergies] = useState("");

  // Lab selection
  const [selectedLab, setSelectedLab] = useState("");

  // Lab tests - Updated with comprehensive sections
  const [labTests, setLabTests] = useState({
    // Sample Sources
    venousBlood: false, capillaryBlood: false, arterialBlood: false,
    urineMSU: false, urineCSU: false, urine24Hr: false,
    stool: false, sputum: false, csf: false,
    pleuralFluid: false, asciticFluid: false, pericardialFluid: false,
    synovialFluid: false, pusAspirate: false, woundSwab: false,
    throatSwab: false, nasopharyngealSwab: false, earSwab: false,
    eyeSwab: false, hvs: false, endocervicalSwab: false,
    urethralSwab: false, semen: false, tissueBiopsy: false,
    fna: false, boneMarrowAspirate: false, skinScraping: false,
    nailClippings: false, hairSample: false, catheterTip: false,
    bal: false, gastricAspirate: false,
    // Haematology
    cbc: false, hemoglobin: false, wbcDiff: false, plateletCount: false,
    esr: false, peripheralBloodFilm: false, bloodGroup: false,
    crossMatch: false, coagulationProfile: false, dDimer: false,
    hemoglobinElectrophoresis: false, sickleCell: false, g6pd: false,
    boneMarrowExam: false,
    // Biochemistry
    ue: false, egfr: false, lft: false, fbg: false, rbg: false,
    ogtt: false, hba1c: false, lipidProfile: false, tft: false,
    calcium: false, magnesium: false, phosphate: false, uricAcid: false,
    ironStudies: false, vitaminB12: false, folate: false, vitaminD: false,
    crp: false, procalcitonin: false, troponin: false, bnp: false,
    ldh: false, amylase: false, lipase: false, serumLactate: false,
    abg: false, vbg: false, spep: false,
    // Microbiology
    bloodCulture: false, urineMCS: false, stoolMCS: false, sputumMCS: false,
    csfMCS: false, woundSwabMCS: false, throatSwabMCS: false, earSwabMCS: false,
    eyeSwabMCS: false, hvsMCS: false, endocervicalMCS: false, urethralMCS: false,
    pusCulture: false, semenCulture: false, catheterTipCulture: false,
    tbTesting: false, hivScreening: false, hepBScreening: false,
    hepCScreening: false, syphilisSerology: false, covidTesting: false,
    influenzaTesting: false,
    // Mycology
    fungalMicroscopy: false, fungalCulture: false, kohPreparation: false,
    cryptococcalAntigen: false, aspergillusAntigen: false, candidaSpeciation: false,
    fungalSensitivity: false,
    // Parasitology
    stoolOcp: false, malariaParasite: false, microfilaria: false,
    urineSchistosomiasis: false, skinSnip: false, bloodParasite: false,
    toxoplasmosis: false,
    // Histopathology
    tissueBiopsyExam: false, fnac: false, boneMarrowBiopsy: false,
    excisionBiopsy: false, incisionalBiopsy: false, endometrialBiopsy: false,
    cervicalBiopsy: false, giBiopsy: false, skinBiopsy: false,
    lymphNodeBiopsy: false, cytology: false, papSmear: false,
    frozenSection: false, ihc: false,
    // Other
    pregnancyTest: false, toxicologyScreen: false, therapeuticDrugMonitoring: false,
    autoimmuneScreen: false, allergyTesting: false, tumourMarkers: false,
    geneticTesting: false, newbornScreening: false, occupationalHealth: false,
    // Custom fields
    otherLabTest: ""
  });

  // Diagnostic Imaging state
  const [diagnosticTests, setDiagnosticTests] = useState({
    // X-Ray
    chestXRay: false, abdomenXRay: false, skullXRay: false,
    cervicalSpineXRay: false, thoracicSpineXRay: false, lumbarSpineXRay: false,
    pelvisXRay: false, upperLimbXRay: false, lowerLimbXRay: false,
    facialBonesXRay: false, sinusesXRay: false, skeletalSurvey: false,
    otherXRay: "",
    // CT Scan
    ctBrain: false, ctNeck: false, ctChest: false, ctAbdomen: false,
    ctPelvis: false, ctAbdomenPelvis: false, ctPA: false, ctCA: false,
    ctSpine: false, ctAngiography: false, ctUrogram: false, ctGuided: false,
    otherCT: "",
    ctContrast: "",
    // MRI
    mriBrain: false, mriSpine: false, mriAbdomen: false, mriPelvis: false,
    mriShoulder: false, mriKnee: false, mriLiver: false, mrcp: false,
    mra: false, cardiacMRI: false, breastMRI: false, prostateMRI: false,
    wholeBodyMRI: false, otherMRI: "",
    mriContrast: "",
    // Ultrasound
    usAbdomen: false, usPelvis: false, usAbdomenPelvis: false,
    usHepatobiliary: false, usRenal: false, usObstetric: false,
    usTransvaginal: false, usScrotal: false, usProstate: false,
    usThyroid: false, usBreast: false, usSoftTissue: false,
    usNeck: false, usVenousDoppler: false, usArterialDoppler: false,
    usCarotidDoppler: false, usEchocardiography: false, usFAST: false,
    usGuidedAspiration: false, otherUS: "",
    // Endoscopy
    gastroscopy: false, colonoscopy: false, flexibleSigmoidoscopy: false,
    proctoscopy: false, ercp: false, capsuleEndoscopy: false,
    enteroscopy: false, endoscopicUltrasound: false, otherEndoscopy: "",
    // Bronchoscopy
    flexibleBronchoscopy: false, rigidBronchoscopy: false, balBronchoscopy: false,
    endobronchialBiopsy: false, transbronchialBiopsy: false, ebus: false,
    foreignBodyRemoval: false, therapeuticBronchoscopy: false, otherBronchoscopy: "",
    // Colposcopy
    diagnosticColposcopy: false, colposcopyBiopsy: false,
    colposcopyECC: false, colposcopyDirectedBiopsy: false,
    colposcopyTreatment: false, followUpColposcopy: false, otherColposcopy: "",
    // Other Procedures
    fluoroscopy: false, mammography: false, dexa: false,
    nuclearMedicine: false, petCT: false, hysteroscopy: false,
    cystoscopy: false, laryngoscopy: false, flexibleNasoendoscopy: false,
    angiography: false, otherProcedure: ""
  });

  const [referralSpecialist, setReferralSpecialist] = useState("");
  const [referralFacility, setReferralFacility] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [referralNotes, setReferralNotes] = useState("");

  // Form input fields
  const [otherCandSSource, setOtherCandSSource] = useState("");
  const [chlamydiaSource, setChlamydiaSource] = useState("");
  const [gcOtherThanCervixSpecify, setGcOtherThanCervixSpecify] = useState("");
  const [labNotes, setLabNotes] = useState("");
  const [specimenType, setSpecimenType] = useState("Blood");
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionTime, setCollectionTime] = useState("");

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (floatingRef.current) {
      const rect = floatingRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 320));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 200));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleFloating = () => {
    setIsFloating(!isFloating);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Get drugs for selected category
  const getDrugsForCategory = (category: string) => {
    return drugCategories[category as keyof typeof drugCategories] || [];
  };

  // Add drug to medication list
  const addDrugToMeds = (drugName: string) => {
    if (meds.some(m => m.name === drugName)) {
      toast({ title: "Drug already added", description: "This medication is already in the list.", variant: "destructive" });
      return;
    }
    const firstEmpty = meds.findIndex(m => !m.name);
    if (firstEmpty !== -1) {
      const updated = [...meds];
      updated[firstEmpty] = {
        ...updated[firstEmpty],
        name: drugName,
        dosageForm: "",
        strength: "",
        unit: "",
        route: "",
        frequency: "",
        duration: "",
        instructions: ""
      };
      setMeds(updated);
    } else {
      setMeds([...meds, {
        id: crypto.randomUUID(),
        name: drugName,
        dosageForm: "",
        strength: "",
        unit: "",
        route: "",
        frequency: "",
        duration: "",
        instructions: ""
      }]);
    }
    setSelectedDrug("");
    setSelectedCategory("");
    setManualDrug("");
  };

  // Handle manual drug entry
  const handleManualDrugAdd = () => {
    if (manualDrug.trim()) {
      addDrugToMeds(manualDrug.trim());
    } else {
      toast({ title: "Please enter a medication name", variant: "destructive" });
    }
  };

  // Handle signature file upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
        toast({ title: "Signature uploaded", description: "Your signature has been uploaded successfully." });
      };
      reader.readAsDataURL(file);
    }
  };

  const requireConsultationUuid = () => {
    if (!consultationUuid) {
      toast({
        title: "Consultation unavailable",
        description: "This appointment is missing the consultation record needed to continue.",
        variant: "destructive",
      });
      return null;
    }
    return consultationUuid;
  };

  const keyToLabel = (value: string) =>
    value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase())
      .trim();

  const selectedLabels = (record: Record<string, unknown>) =>
    Object.entries(record)
      .filter(([, value]) => value === true)
      .map(([key]) => keyToLabel(key));

  const handleSaveClinicalNotes = async (completeAppointment = false) => {
    const targetConsultationUuid = requireConsultationUuid();
    if (!targetConsultationUuid) return;
    if (!signature) {
      toast({ title: "Signature required", description: "Please upload your signature before saving notes.", variant: "destructive" });
      return;
    }

    const body = notesViewMode === "structured"
      ? {
          notes_mode: "structured",
          type: "follow_up",
          presenting_complaint: noteData.pc,
          history_of_presenting_complaint: noteData.hpc,
          medical_social_history: noteData.medicalSocialHistory,
          medication_allergy: noteData.medicationAllergy,
          examination: noteData.examination,
          investigation_results: noteData.investigationResults,
          diagnosis: noteData.diagnosis,
          treatment: noteData.treatment,
          plan_referral: noteData.planReferral,
          notes_signed_on: signatureDate,
        }
      : {
          notes_mode: "free_text",
          clinical_notes: freeTextNotes,
        };

    setActionBusy(completeAppointment ? "complete" : "notes");
    try {
      await api.doctorPortal.consultations.saveClinicalNotes(targetConsultationUuid, body);
      if (completeAppointment && appointmentUuid) {
        await api.doctorPortal.appointments.complete(appointmentUuid, {
          type: "follow_up",
          diagnosis: noteData.diagnosis,
          reason_for_visit: consult.reason,
          clinical_notes: notesViewMode === "free" ? freeTextNotes : noteData.examination || noteData.treatment,
          summary: noteData.treatment || freeTextNotes,
        });
      }
      toast({
        title: completeAppointment ? "Consultation completed" : "Notes saved",
        description: completeAppointment ? "The appointment has been completed." : "Clinical notes were saved to the EMR.",
      });
    } catch (error) {
      toast({
        title: "Unable to save notes",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionBusy(null);
    }
  };

  const handleSendPrescription = async () => {
    const targetConsultationUuid = requireConsultationUuid();
    if (!targetConsultationUuid) return;
    if (!signature) {
      toast({ title: "Signature required", description: "Please upload your signature before sending.", variant: "destructive" });
      return;
    }
    if (!selectedPharmacy) {
      toast({ title: "Pharmacy required", description: "Please select a pharmacy before sending.", variant: "destructive" });
      return;
    }
    if (meds.some((med) => !med.name.trim())) {
      toast({ title: "Missing medication details", description: "Please fill in all medication names.", variant: "destructive" });
      return;
    }

    setActionBusy("prescription");
    try {
      await api.doctorPortal.consultations.createPrescription(targetConsultationUuid, {
        pharmacy_name: selectedPharmacy.replace(/-/g, " "),
        refills_allowed: Number(refills) || 0,
        prescribed_on: signatureDate,
        medications: meds.map((med) => ({
          drug_name: med.name,
          drug_id: null,
          dosage_form: med.dosageForm,
          strength: med.strength,
          unit: med.unit,
          route: med.route,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
        })),
      });
      toast({ title: "Prescription sent", description: "Prescription document was created in the EMR." });
    } catch (error) {
      toast({
        title: "Unable to send prescription",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionBusy(null);
    }
  };

  const handleSendLabRequisition = async () => {
    const targetConsultationUuid = requireConsultationUuid();
    if (!targetConsultationUuid) return;
    if (!signature) {
      toast({ title: "Signature required", description: "Please upload your signature before sending to lab.", variant: "destructive" });
      return;
    }

    const tests = selectedLabels(labTests).map((testName) => ({
      test_name: testName,
      lab_test_id: null,
      category_name: "Laboratory",
      instructions: labNotes,
    }));

    if (tests.length === 0 && !labTests.otherLabTest) {
      toast({ title: "No lab test selected", description: "Please select at least one lab test.", variant: "destructive" });
      return;
    }

    setActionBusy("lab");
    try {
      await api.doctorPortal.consultations.createLabRequisition(targetConsultationUuid, {
        payment_agency: paymentAgency || otherPaymentAgency || "MB",
        laboratory_name: selectedLab || "Laboratory",
        sample_sources: [specimenType, collectionDate, collectionTime].filter(Boolean),
        clinical_notes: labNotes,
        requested_on: signatureDate,
        tests: tests.length ? tests : [{ test_name: labTests.otherLabTest, lab_test_id: null, category_name: "Laboratory" }],
      });
      toast({ title: "Lab requisition sent", description: "Lab requisition was created in the EMR." });
    } catch (error) {
      toast({
        title: "Unable to send lab requisition",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionBusy(null);
    }
  };

  const handleSendDiagnosticRequest = async () => {
    const targetConsultationUuid = requireConsultationUuid();
    if (!targetConsultationUuid) return;
    if (!signature) {
      toast({ title: "Signature required", description: "Please upload your signature before sending.", variant: "destructive" });
      return;
    }

    const procedures = selectedLabels(diagnosticTests).map((procedureName) => ({
      procedure_name: procedureName,
      imaging_procedure_id: null,
      modality_name: procedureName.includes("MRI") ? "MRI" : procedureName.includes("CT") ? "CT" : procedureName.includes("X Ray") ? "X-Ray" : "Imaging",
      contrast: diagnosticTests.ctContrast || diagnosticTests.mriContrast || "Without Contrast",
    }));

    if (procedures.length === 0) {
      toast({ title: "No diagnostic procedure selected", description: "Please select at least one imaging procedure.", variant: "destructive" });
      return;
    }

    setActionBusy("diagnostic");
    try {
      await api.doctorPortal.consultations.createDiagnosticRequest(targetConsultationUuid, {
        clinical_notes: noteData.investigationResults || labNotes,
        requested_on: signatureDate,
        procedures,
      });
      toast({ title: "Diagnostic imaging request sent", description: "Diagnostic request was created in the EMR." });
    } catch (error) {
      toast({
        title: "Unable to send diagnostic request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionBusy(null);
    }
  };

  const handleSendReferral = async () => {
    const targetConsultationUuid = requireConsultationUuid();
    if (!targetConsultationUuid) return;
    if (!signature) {
      toast({ title: "Signature required", description: "Please upload your signature before sending referral.", variant: "destructive" });
      return;
    }

    setActionBusy("referral");
    try {
      await api.doctorPortal.consultations.createReferral(targetConsultationUuid, {
        referral_specialist_id: null,
        specialist_name: referralSpecialist || "Specialist",
        referral_facility_id: null,
        facility_name: referralFacility || "Facility",
        reason: referralReason || noteData.planReferral || "Referral from consultation",
        additional_notes: referralNotes,
        referred_on: signatureDate,
      });
      toast({ title: "Referral sent", description: "Referral was created in the EMR." });
    } catch (error) {
      toast({
        title: "Unable to send referral",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionBusy(null);
    }
  };

  // LabCheckbox component
  const LabCheckbox = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center space-x-1.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="h-3.5 w-3.5" />
      <Label htmlFor={id} className="text-xs cursor-pointer leading-none">{label}</Label>
    </div>
  );

  // DiagCheckbox component
  const DiagCheckbox = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center space-x-1.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="h-3.5 w-3.5" />
      <Label htmlFor={id} className="text-xs cursor-pointer leading-none">{label}</Label>
    </div>
  );

  // Section component
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{title}</p>
      {children}
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      {/* Floating Video Call Interface */}
      {isFloating && (
        <div
          ref={floatingRef}
          className="fixed z-50 shadow-2xl rounded-xl border border-border/60 bg-background overflow-hidden"
          style={{
            top: position.y,
            left: position.x,
            width: isMinimized ? '280px' : '320px',
            minWidth: '280px',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Drag Handle */}
          <div 
            className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/60 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Move className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{consult.patient}</span>
              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800">Live</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={toggleMinimize}>
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={toggleFloating}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Video */}
              <div className="aspect-video bg-gradient-to-br from-muted-foreground/30 to-foreground flex items-center justify-center relative">
                {camOn ? (
                  <div className="text-center">
                    <Avatar className="h-14 w-14 mx-auto mb-1.5"><AvatarFallback className="bg-primary text-primary-foreground text-xl">{consult.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                    <p className="text-xs font-medium text-white">{consult.patient}</p>
                    <p className="text-[10px] opacity-60 text-white">{consult.reason}</p>
                  </div>
                ) : (
                  <div className="text-center opacity-60">
                    <VideoOff className="h-8 w-8 mx-auto mb-1 text-white" />
                    <p className="text-xs text-white">Camera off</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/20 backdrop-blur px-2 py-0.5 rounded-full text-[10px] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Recording
                </div>
                <div className="absolute bottom-2 right-2 w-14 aspect-video rounded-lg bg-foreground/40 border border-background/20 flex items-center justify-center text-[8px] opacity-70 text-white">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/80 text-white text-xs">DR</AvatarFallback></Avatar>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-1.5 p-2 bg-muted/10">
                <Button size="icon" variant={micOn ? "secondary" : "destructive"} className="h-7 w-7" onClick={() => setMicOn(!micOn)}>
                  {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant={camOn ? "secondary" : "destructive"} className="h-7 w-7" onClick={() => setCamOn(!camOn)}>
                  {camOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="secondary" className="h-7 w-7"><ScreenShare className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="destructive" className="h-7 w-7"><PhoneOff className="h-3.5 w-3.5" /></Button>
              </div>

              {/* Call duration */}
              <div className="text-center text-[10px] text-muted-foreground py-1 bg-muted/5">
                Call duration: 12:34
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild><Link to="/doctor/consultations"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold truncate">Consultation • {consult.patient}</h1>
            <p className="text-xs text-muted-foreground truncate">{consult.reason} • {consult.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={isFloating ? "default" : "outline"} size="sm" onClick={toggleFloating}>
            {isFloating ? <Minimize2 className="h-3.5 w-3.5 mr-1" /> : <Maximize2 className="h-3.5 w-3.5 mr-1" />}
            {isFloating ? "Hide Call" : "Show Call"}
          </Button>
          <Badge variant="default" className="shrink-0">Live</Badge>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Info Sidebar */}
          <Card className="lg:col-span-1 border-border/60">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-lg">{consult.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold text-sm">{consult.patient}</p>
                  <p className="text-xs text-muted-foreground">{mockPatientData.age} yrs • {mockPatientData.gender}</p>
                  <p className="text-xs text-muted-foreground">ID: {mockPatientData.id}</p>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  Allergies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mockPatientData.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-[10px] px-2 py-0.5 rounded-full font-normal">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/60 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                  <Pill className="h-3 w-3 text-primary" />
                  Current Medications
                </p>
                <div className="space-y-1">
                  {mockPatientData.currentMedications.map((med, index) => (
                    <div key={index} className="text-xs flex items-start gap-1.5">
                      <span className="text-primary font-medium">•</span>
                      <span>
                        <span className="font-medium">{med.name}</span>
                        <span className="text-muted-foreground"> {med.dosage}</span>
                        <span className="text-muted-foreground text-[10px]"> — {med.frequency}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/60 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-500" />
                  Medical History
                </p>
                <ul className="text-xs space-y-0.5">
                  {mockPatientData.medicalHistory.map((item, index) => (
                    <li key={index} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border/60 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Previous Consultations
                </p>
                <ul className="text-xs space-y-1">
                  {mockPatientData.previousConsultations.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{item.date}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {item.specialty}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Main Form */}
          <Card className="lg:col-span-3 border-border/60">
            <CardContent className="p-6">
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="w-full grid grid-cols-5 mb-6">
                  <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
                  <TabsTrigger value="rx">Meds</TabsTrigger>
                  <TabsTrigger value="lab">Lab</TabsTrigger>
                  <TabsTrigger value="diag">Diag</TabsTrigger>
                  <TabsTrigger value="ref">Referral</TabsTrigger>
                </TabsList>

                {/* Clinical Notes */}
                <TabsContent value="notes" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1">
                      <Button
                        variant={notesViewMode === "structured" ? "default" : "ghost"}
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => setNotesViewMode("structured")}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Structured Fields
                      </Button>
                      <Button
                        variant={notesViewMode === "free" ? "default" : "ghost"}
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => setNotesViewMode("free")}
                      >
                        <AlignJustify className="h-3.5 w-3.5" />
                        Free Text
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {notesViewMode === "structured" ? "Fill in individual fields" : "Type everything in one place"}
                    </span>
                  </div>

                  {notesViewMode === "structured" && (
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="PC (Presenting Complaint)">
                          <Textarea rows={2} value={noteData.pc} onChange={(e) => setNoteData({ ...noteData, pc: e.target.value })} placeholder="e.g., Chest pain, shortness of breath..." />
                        </Field>
                        <Field label="HPC (History of Presenting Complaint)">
                          <Textarea rows={2} value={noteData.hpc} onChange={(e) => setNoteData({ ...noteData, hpc: e.target.value })} placeholder="e.g., 2-day history of central chest pain..." />
                        </Field>
                      </div>
                      <Field label="Medical History / Social History">
                        <Textarea rows={3} value={noteData.medicalSocialHistory} onChange={(e) => setNoteData({ ...noteData, medicalSocialHistory: e.target.value })} placeholder="e.g., Hypertension, Diabetes Type 2, Non-smoker, occasional alcohol..." />
                      </Field>
                      <Field label="Medication / Allergy">
                        <Textarea rows={3} value={noteData.medicationAllergy} onChange={(e) => setNoteData({ ...noteData, medicationAllergy: e.target.value })} placeholder="e.g., Lisinopril 10mg daily, Penicillin allergy, Ibuprofen allergy..." />
                      </Field>
                      <Field label="Examination">
                        <Textarea rows={3} value={noteData.examination} onChange={(e) => setNoteData({ ...noteData, examination: e.target.value })} placeholder="e.g., BP 140/90, HR 78, Chest clear, ECG shows..." />
                      </Field>
                      <Field label="Investigation Results">
                        <Textarea rows={2} value={noteData.investigationResults} onChange={(e) => setNoteData({ ...noteData, investigationResults: e.target.value })} placeholder="e.g., CBC: WBC 12.5, CRP 45, Troponin negative..." />
                      </Field>
                      <Field label="Diagnosis">
                        <Textarea rows={2} value={noteData.diagnosis} onChange={(e) => setNoteData({ ...noteData, diagnosis: e.target.value })} placeholder="e.g., I10 Essential Hypertension, Angina Pectoris..." />
                      </Field>
                      <Field label="Treatment">
                        <Textarea rows={2} value={noteData.treatment} onChange={(e) => setNoteData({ ...noteData, treatment: e.target.value })} placeholder="e.g., Started on Lisinopril 10mg, Aspirin 81mg..." />
                      </Field>
                      <Field label="Plan / Referral">
                        <Textarea rows={2} value={noteData.planReferral} onChange={(e) => setNoteData({ ...noteData, planReferral: e.target.value })} placeholder="e.g., Refer to Cardiology, F/U in 2 weeks..." />
                      </Field>
                    </div>
                  )}

                  {notesViewMode === "free" && (
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <Field label="Clinical Notes (Free Text)">
                        <Textarea rows={15} value={freeTextNotes} onChange={(e) => setFreeTextNotes(e.target.value)} placeholder="Enter complete clinical notes here..." className="min-h-[350px] font-mono text-sm" />
                      </Field>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Tip:</span> You can use the structured format above or type freely in any format you prefer.
                      </p>
                    </div>
                  )}

                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Signature className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Doctor's Signature</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Signature</Label>
                        <div className="mt-1">
                          {signature ? (
                            <div className="relative">
                              <img src={signature} alt="Doctor's Signature" className="max-h-16 border border-border/60 rounded-lg p-2 bg-white" />
                              <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => setSignature("")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground">Upload signature image</p>
                              <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG</p>
                              <Input type="file" accept="image/*" className="hidden" id="signature-upload-notes" onChange={handleSignatureUpload} />
                              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => document.getElementById('signature-upload-notes')?.click()}>
                                <Upload className="h-3 w-3 mr-1" /> Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <Input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-2">By signing, you confirm the accuracy of these clinical notes.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      {autoSave === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Auto-saving...</>}
                      {autoSave === "saved" && <><Check className="h-3 w-3 text-primary" /> All changes saved</>}
                      {autoSave === "idle" && "No changes"}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" onClick={() => handleSaveClinicalNotes(false)} disabled={!!actionBusy}>
                        {actionBusy === "notes" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Notes
                      </Button>
                      <Button onClick={() => handleSaveClinicalNotes(true)} disabled={!!actionBusy || !appointmentUuid}>
                        {actionBusy === "complete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Complete Appointment
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Prescription - Meds */}
                <TabsContent value="rx" className="space-y-4">
                  {/* Patient & Doctor Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/5 rounded-lg border border-border/60">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Patient Information</p>
                      <p className="font-medium text-sm">{mockPatientData.name}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <span>{mockPatientData.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          <span>{mockPatientData.email}</span>
                        </div>
                        <div>DOB: {mockPatientData.dob} • {mockPatientData.gender}</div>
                        <div>Patient ID: {mockPatientData.patientId} • MHSC: {mockPatientData.mhsc}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Physician Information</p>
                      <p className="font-medium text-sm">{mockDoctorData.name}</p>
                      <p className="text-xs text-muted-foreground">{mockDoctorData.specialty}</p>
                      <p className="text-xs text-muted-foreground">License: {mockDoctorData.license}</p>
                      <p className="text-xs text-muted-foreground">{mockDoctorData.hospital}</p>
                    </div>
                  </div>

                  {/* Pharmacy Dropdown */}
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <Label className="text-sm font-semibold">Select Pharmacy</Label>
                    <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a pharmacy..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shoppers-drug-mart">Shoppers Drug Mart</SelectItem>
                        <SelectItem value="rexall">Rexall</SelectItem>
                        <SelectItem value="london-drugs">London Drugs</SelectItem>
                        <SelectItem value="costco-pharmacy">Costco Pharmacy</SelectItem>
                        <SelectItem value="walmart-pharmacy">Walmart Pharmacy</SelectItem>
                        <SelectItem value="superstore-pharmacy">Superstore Pharmacy</SelectItem>
                        <SelectItem value="guardian-pharmacy">Guardian Pharmacy</SelectItem>
                        <SelectItem value="pharmasave">Pharmasave</SelectItem>
                        <SelectItem value="independent-pharmacy">Independent Pharmacy</SelectItem>
                        <SelectItem value="other-pharmacy">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedPharmacy === "other-pharmacy" && (
                      <Input className="mt-2" placeholder="Enter pharmacy name and address" onChange={(e) => setSelectedPharmacy(e.target.value)} />
                    )}
                  </div>

                  {/* Drug Selection - Categories and Drugs with Manual Entry */}
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <Label className="text-sm font-semibold">Select or Enter Medication</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedDrug(""); }}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(drugCategories).map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Drug</Label>
                        <Select value={selectedDrug} onValueChange={setSelectedDrug}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Select drug" /></SelectTrigger>
                          <SelectContent>
                            {selectedCategory && getDrugsForCategory(selectedCategory).map((drug) => (
                              <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs text-muted-foreground">Or Type Medication Manually</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="Enter medication name..." value={manualDrug} onChange={(e) => setManualDrug(e.target.value)} className="flex-1" onKeyPress={(e) => e.key === 'Enter' && handleManualDrugAdd()} />
                        <Button size="sm" variant="outline" onClick={handleManualDrugAdd}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1" onClick={() => selectedDrug && addDrugToMeds(selectedDrug)} disabled={!selectedDrug}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Selected Drug
                      </Button>
                    </div>
                  </div>

                  {/* Medication List */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Prescribed Medications</p>
                    {meds.map((m, i) => (
                      <div key={m.id} className="border border-border/60 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Medication #{i + 1}</span>
                          {meds.length > 1 && (
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setMeds(meds.filter((x) => x.id !== m.id))}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Input placeholder="Medication name" value={m.name} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} />
                        
                        {/* Dosage Form, Strength, Unit */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Dosage Form</Label>
                            <Select value={m.dosageForm} onValueChange={(val) => setMeds(meds.map(x => x.id === m.id ? { ...x, dosageForm: val } : x))}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Form" />
                              </SelectTrigger>
                              <SelectContent>
                                {dosageForms.map((form) => (
                                  <SelectItem key={form} value={form}>{form}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Strength</Label>
                            <Input placeholder="e.g., 500, 10" value={m.strength} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, strength: e.target.value } : x))} className="h-9 text-xs" />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Unit</Label>
                            <Select value={m.unit} onValueChange={(val) => setMeds(meds.map(x => x.id === m.id ? { ...x, unit: val } : x))}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Route */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Route of Administration</Label>
                          <Select value={m.route} onValueChange={(val) => setMeds(meds.map(x => x.id === m.id ? { ...x, route: val } : x))}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select route..." />
                            </SelectTrigger>
                            <SelectContent>
                              {routesOfAdministration.map((route) => (
                                <SelectItem key={route} value={route}>{route}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Frequency and Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input placeholder="Frequency (e.g., 3x daily)" value={m.frequency} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, frequency: e.target.value } : x))} />
                          <Input placeholder="Duration (e.g., 7 days)" value={m.duration} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, duration: e.target.value } : x))} />
                        </div>
                        <Textarea rows={2} placeholder="Special instructions" value={m.instructions} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, instructions: e.target.value } : x))} />
                      </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setMeds([...meds, {
                      id: crypto.randomUUID(),
                      name: "",
                      dosageForm: "",
                      strength: "",
                      unit: "",
                      route: "",
                      frequency: "",
                      duration: "",
                      instructions: ""
                    }])}>
                      <Plus className="h-3.5 w-3.5" /> Add another medication
                    </Button>
                  </div>

                  {/* Refills */}
                  <div className="border border-border/60 rounded-lg p-4">
                    <Label className="text-sm font-semibold">Refills</Label>
                    <Select value={refills} onValueChange={setRefills}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Number of refills" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 refills</SelectItem>
                        <SelectItem value="1">1 refill</SelectItem>
                        <SelectItem value="2">2 refills</SelectItem>
                        <SelectItem value="3">3 refills</SelectItem>
                        <SelectItem value="5">5 refills</SelectItem>
                        <SelectItem value="10">10 refills</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doctor Signature Section */}
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Signature className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Doctor's Signature</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Signature</Label>
                        <div className="mt-1">
                          {signature ? (
                            <div className="relative">
                              <img src={signature} alt="Doctor's Signature" className="max-h-16 border border-border/60 rounded-lg p-2 bg-white" />
                              <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => setSignature("")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground">Upload signature image</p>
                              <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG</p>
                              <Input type="file" accept="image/*" className="hidden" id="signature-upload-rx" onChange={handleSignatureUpload} />
                              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => document.getElementById('signature-upload-rx')?.click()}>
                                <Upload className="h-3 w-3 mr-1" /> Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <Input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-2">By signing, you confirm the accuracy of this prescription.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => toast({ title: "Prescription generated", description: "PDF created for download." })}><FileText className="h-4 w-4 mr-2" /> Generate</Button>
                    <Button className="flex-1" onClick={handleSendPrescription} disabled={!!actionBusy}>
                      {actionBusy === "prescription" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Send to Pharmacy
                    </Button>
                  </div>
                </TabsContent>

                {/* Lab - Comprehensive */}
                <TabsContent value="lab" className="space-y-4">
                  <div className="overflow-y-auto max-h-[600px] pr-2">
                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/5 rounded-lg border border-border/60">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Patient Information</p>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{mockPatientData.name}</p></div>
                          <div><p className="text-xs text-muted-foreground">DOB</p><p className="text-sm">{mockPatientData.dob}</p></div>
                          <div><p className="text-xs text-muted-foreground">Gender</p><p className="text-sm">{mockPatientData.gender}</p></div>
                          <div><p className="text-xs text-muted-foreground">Patient ID</p><p className="text-sm">{mockPatientData.patientId}</p></div>
                          <div className="col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="text-sm">{mockPatientData.address}</p></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Physician Information</p>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div className="col-span-2"><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{mockDoctorData.name}</p></div>
                          <div className="col-span-2"><p className="text-xs text-muted-foreground">Specialty</p><p className="text-sm">{mockDoctorData.specialty}</p></div>
                          <div><p className="text-xs text-muted-foreground">License</p><p className="text-sm">{mockDoctorData.license}</p></div>
                          <div><p className="text-xs text-muted-foreground">Hospital</p><p className="text-sm">{mockDoctorData.hospital}</p></div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Agency */}
                    <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment Agency</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="payMB" className="h-4 w-4" checked={paymentAgency === "MB"} onCheckedChange={() => setPaymentAgency("MB")} />
                          <Label htmlFor="payMB" className="text-sm cursor-pointer">MB</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="payWCB" className="h-4 w-4" checked={paymentAgency === "WCB"} onCheckedChange={() => setPaymentAgency("WCB")} />
                          <Label htmlFor="payWCB" className="text-sm cursor-pointer">WCB</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="payOther" className="h-4 w-4" checked={paymentAgency === "Other"} onCheckedChange={() => setPaymentAgency("Other")} />
                            <Label htmlFor="payOther" className="text-sm cursor-pointer">Other</Label>
                          </div>
                          <Input className="h-9 text-sm w-40" placeholder="Private" value={otherPaymentAgency} onChange={(e) => setOtherPaymentAgency(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Laboratory Dropdown */}
                    <div className="border border-border/60 rounded-lg p-4">
                      <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Laboratory</Label>
                      <Select value={selectedLab} onValueChange={setSelectedLab}>
                        <SelectTrigger className="h-9 text-sm mt-2"><SelectValue placeholder="Choose laboratory..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dynacare">Dynacare</SelectItem>
                          <SelectItem value="cadham">Cadham Provincial Laboratory</SelectItem>
                          <SelectItem value="canadian_blood">Canadian Blood Services</SelectItem>
                          <SelectItem value="other_lab">Other Laboratory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* SECTION 1: LABORATORY TESTS */}
                    <div className="border border-border/60 rounded-lg p-4 bg-primary/5">
                      {/* Sample Sources */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sample Source(s) (Select all that apply)</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="venousBlood" label="Venous Blood" checked={labTests.venousBlood} onChange={() => setLabTests({ ...labTests, venousBlood: !labTests.venousBlood })} />
                          <LabCheckbox id="capillaryBlood" label="Capillary Blood" checked={labTests.capillaryBlood} onChange={() => setLabTests({ ...labTests, capillaryBlood: !labTests.capillaryBlood })} />
                          <LabCheckbox id="arterialBlood" label="Arterial Blood" checked={labTests.arterialBlood} onChange={() => setLabTests({ ...labTests, arterialBlood: !labTests.arterialBlood })} />
                          <LabCheckbox id="urineMSU" label="Urine – Midstream (MSU)" checked={labTests.urineMSU} onChange={() => setLabTests({ ...labTests, urineMSU: !labTests.urineMSU })} />
                          <LabCheckbox id="urineCSU" label="Urine – Catheter Specimen" checked={labTests.urineCSU} onChange={() => setLabTests({ ...labTests, urineCSU: !labTests.urineCSU })} />
                          <LabCheckbox id="urine24Hr" label="Urine – 24-Hour Collection" checked={labTests.urine24Hr} onChange={() => setLabTests({ ...labTests, urine24Hr: !labTests.urine24Hr })} />
                          <LabCheckbox id="stool" label="Stool/Faeces" checked={labTests.stool} onChange={() => setLabTests({ ...labTests, stool: !labTests.stool })} />
                          <LabCheckbox id="sputum" label="Sputum" checked={labTests.sputum} onChange={() => setLabTests({ ...labTests, sputum: !labTests.sputum })} />
                          <LabCheckbox id="csf" label="Cerebrospinal Fluid (CSF)" checked={labTests.csf} onChange={() => setLabTests({ ...labTests, csf: !labTests.csf })} />
                          <LabCheckbox id="pleuralFluid" label="Pleural Fluid" checked={labTests.pleuralFluid} onChange={() => setLabTests({ ...labTests, pleuralFluid: !labTests.pleuralFluid })} />
                          <LabCheckbox id="asciticFluid" label="Ascitic/Peritoneal Fluid" checked={labTests.asciticFluid} onChange={() => setLabTests({ ...labTests, asciticFluid: !labTests.asciticFluid })} />
                          <LabCheckbox id="pericardialFluid" label="Pericardial Fluid" checked={labTests.pericardialFluid} onChange={() => setLabTests({ ...labTests, pericardialFluid: !labTests.pericardialFluid })} />
                          <LabCheckbox id="synovialFluid" label="Synovial Fluid" checked={labTests.synovialFluid} onChange={() => setLabTests({ ...labTests, synovialFluid: !labTests.synovialFluid })} />
                          <LabCheckbox id="pusAspirate" label="Pus/Aspirate" checked={labTests.pusAspirate} onChange={() => setLabTests({ ...labTests, pusAspirate: !labTests.pusAspirate })} />
                          <LabCheckbox id="woundSwab" label="Wound Swab" checked={labTests.woundSwab} onChange={() => setLabTests({ ...labTests, woundSwab: !labTests.woundSwab })} />
                          <LabCheckbox id="throatSwab" label="Throat Swab" checked={labTests.throatSwab} onChange={() => setLabTests({ ...labTests, throatSwab: !labTests.throatSwab })} />
                          <LabCheckbox id="nasopharyngealSwab" label="Nasopharyngeal Swab" checked={labTests.nasopharyngealSwab} onChange={() => setLabTests({ ...labTests, nasopharyngealSwab: !labTests.nasopharyngealSwab })} />
                          <LabCheckbox id="earSwab" label="Ear Swab" checked={labTests.earSwab} onChange={() => setLabTests({ ...labTests, earSwab: !labTests.earSwab })} />
                          <LabCheckbox id="eyeSwab" label="Eye Swab" checked={labTests.eyeSwab} onChange={() => setLabTests({ ...labTests, eyeSwab: !labTests.eyeSwab })} />
                          <LabCheckbox id="hvs" label="High Vaginal Swab (HVS)" checked={labTests.hvs} onChange={() => setLabTests({ ...labTests, hvs: !labTests.hvs })} />
                          <LabCheckbox id="endocervicalSwab" label="Endocervical Swab" checked={labTests.endocervicalSwab} onChange={() => setLabTests({ ...labTests, endocervicalSwab: !labTests.endocervicalSwab })} />
                          <LabCheckbox id="urethralSwab" label="Urethral Swab" checked={labTests.urethralSwab} onChange={() => setLabTests({ ...labTests, urethralSwab: !labTests.urethralSwab })} />
                          <LabCheckbox id="semen" label="Semen" checked={labTests.semen} onChange={() => setLabTests({ ...labTests, semen: !labTests.semen })} />
                          <LabCheckbox id="tissueBiopsy" label="Tissue Biopsy" checked={labTests.tissueBiopsy} onChange={() => setLabTests({ ...labTests, tissueBiopsy: !labTests.tissueBiopsy })} />
                          <LabCheckbox id="fna" label="Fine Needle Aspirate (FNA)" checked={labTests.fna} onChange={() => setLabTests({ ...labTests, fna: !labTests.fna })} />
                          <LabCheckbox id="boneMarrowAspirate" label="Bone Marrow Aspirate/Biopsy" checked={labTests.boneMarrowAspirate} onChange={() => setLabTests({ ...labTests, boneMarrowAspirate: !labTests.boneMarrowAspirate })} />
                          <LabCheckbox id="skinScraping" label="Skin Scraping" checked={labTests.skinScraping} onChange={() => setLabTests({ ...labTests, skinScraping: !labTests.skinScraping })} />
                          <LabCheckbox id="nailClippings" label="Nail Clippings" checked={labTests.nailClippings} onChange={() => setLabTests({ ...labTests, nailClippings: !labTests.nailClippings })} />
                          <LabCheckbox id="hairSample" label="Hair Sample" checked={labTests.hairSample} onChange={() => setLabTests({ ...labTests, hairSample: !labTests.hairSample })} />
                          <LabCheckbox id="catheterTip" label="Catheter Tip" checked={labTests.catheterTip} onChange={() => setLabTests({ ...labTests, catheterTip: !labTests.catheterTip })} />
                          <LabCheckbox id="bal" label="Bronchoalveolar Lavage (BAL)" checked={labTests.bal} onChange={() => setLabTests({ ...labTests, bal: !labTests.bal })} />
                          <LabCheckbox id="gastricAspirate" label="Gastric Aspirate" checked={labTests.gastricAspirate} onChange={() => setLabTests({ ...labTests, gastricAspirate: !labTests.gastricAspirate })} />
                        </div>
                        <div className="mt-2">
                          <LabCheckbox id="otherSample" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other sample source..." value={labTests.otherLabTest} onChange={(e) => setLabTests({ ...labTests, otherLabTest: e.target.value })} />
                        </div>
                      </div>

                      {/* A. Haematology */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">A. Haematology</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="cbc" label="CBC/FBC" checked={labTests.cbc} onChange={() => setLabTests({ ...labTests, cbc: !labTests.cbc })} />
                          <LabCheckbox id="hemoglobin" label="Haemoglobin (Hb)" checked={labTests.hemoglobin} onChange={() => setLabTests({ ...labTests, hemoglobin: !labTests.hemoglobin })} />
                          <LabCheckbox id="wbcDiff" label="WBC Count and Differential" checked={labTests.wbcDiff} onChange={() => setLabTests({ ...labTests, wbcDiff: !labTests.wbcDiff })} />
                          <LabCheckbox id="plateletCount" label="Platelet Count" checked={labTests.plateletCount} onChange={() => setLabTests({ ...labTests, plateletCount: !labTests.plateletCount })} />
                          <LabCheckbox id="esr" label="ESR" checked={labTests.esr} onChange={() => setLabTests({ ...labTests, esr: !labTests.esr })} />
                          <LabCheckbox id="peripheralBloodFilm" label="Peripheral Blood Film" checked={labTests.peripheralBloodFilm} onChange={() => setLabTests({ ...labTests, peripheralBloodFilm: !labTests.peripheralBloodFilm })} />
                          <LabCheckbox id="bloodGroup" label="Blood Group and Rh Typing" checked={labTests.bloodGroup} onChange={() => setLabTests({ ...labTests, bloodGroup: !labTests.bloodGroup })} />
                          <LabCheckbox id="crossMatch" label="Cross-Match" checked={labTests.crossMatch} onChange={() => setLabTests({ ...labTests, crossMatch: !labTests.crossMatch })} />
                          <LabCheckbox id="coagulationProfile" label="Coagulation Profile (PT/INR, aPTT)" checked={labTests.coagulationProfile} onChange={() => setLabTests({ ...labTests, coagulationProfile: !labTests.coagulationProfile })} />
                          <LabCheckbox id="dDimer" label="D-Dimer" checked={labTests.dDimer} onChange={() => setLabTests({ ...labTests, dDimer: !labTests.dDimer })} />
                          <LabCheckbox id="hemoglobinElectrophoresis" label="Haemoglobin Electrophoresis" checked={labTests.hemoglobinElectrophoresis} onChange={() => setLabTests({ ...labTests, hemoglobinElectrophoresis: !labTests.hemoglobinElectrophoresis })} />
                          <LabCheckbox id="sickleCell" label="Sickle Cell Screening" checked={labTests.sickleCell} onChange={() => setLabTests({ ...labTests, sickleCell: !labTests.sickleCell })} />
                          <LabCheckbox id="g6pd" label="G6PD Screening" checked={labTests.g6pd} onChange={() => setLabTests({ ...labTests, g6pd: !labTests.g6pd })} />
                          <LabCheckbox id="boneMarrowExam" label="Bone Marrow Examination" checked={labTests.boneMarrowExam} onChange={() => setLabTests({ ...labTests, boneMarrowExam: !labTests.boneMarrowExam })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherHaem" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other haematology test..." />
                        </div>
                      </div>

                      {/* B. Biochemistry */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">B. Biochemistry</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="ue" label="Urea, Electrolytes and Creatinine" checked={labTests.ue} onChange={() => setLabTests({ ...labTests, ue: !labTests.ue })} />
                          <LabCheckbox id="egfr" label="eGFR" checked={labTests.egfr} onChange={() => setLabTests({ ...labTests, egfr: !labTests.egfr })} />
                          <LabCheckbox id="lft" label="Liver Function Tests (LFTs)" checked={labTests.lft} onChange={() => setLabTests({ ...labTests, lft: !labTests.lft })} />
                          <LabCheckbox id="fbg" label="Fasting Blood Glucose" checked={labTests.fbg} onChange={() => setLabTests({ ...labTests, fbg: !labTests.fbg })} />
                          <LabCheckbox id="rbg" label="Random Blood Glucose" checked={labTests.rbg} onChange={() => setLabTests({ ...labTests, rbg: !labTests.rbg })} />
                          <LabCheckbox id="ogtt" label="Oral Glucose Tolerance Test" checked={labTests.ogtt} onChange={() => setLabTests({ ...labTests, ogtt: !labTests.ogtt })} />
                          <LabCheckbox id="hba1c" label="HbA1c" checked={labTests.hba1c} onChange={() => setLabTests({ ...labTests, hba1c: !labTests.hba1c })} />
                          <LabCheckbox id="lipidProfile" label="Lipid Profile" checked={labTests.lipidProfile} onChange={() => setLabTests({ ...labTests, lipidProfile: !labTests.lipidProfile })} />
                          <LabCheckbox id="tft" label="Thyroid Function Tests" checked={labTests.tft} onChange={() => setLabTests({ ...labTests, tft: !labTests.tft })} />
                          <LabCheckbox id="calcium" label="Calcium" checked={labTests.calcium} onChange={() => setLabTests({ ...labTests, calcium: !labTests.calcium })} />
                          <LabCheckbox id="magnesium" label="Magnesium" checked={labTests.magnesium} onChange={() => setLabTests({ ...labTests, magnesium: !labTests.magnesium })} />
                          <LabCheckbox id="phosphate" label="Phosphate" checked={labTests.phosphate} onChange={() => setLabTests({ ...labTests, phosphate: !labTests.phosphate })} />
                          <LabCheckbox id="uricAcid" label="Uric Acid" checked={labTests.uricAcid} onChange={() => setLabTests({ ...labTests, uricAcid: !labTests.uricAcid })} />
                          <LabCheckbox id="ironStudies" label="Iron Studies/Ferritin" checked={labTests.ironStudies} onChange={() => setLabTests({ ...labTests, ironStudies: !labTests.ironStudies })} />
                          <LabCheckbox id="vitaminB12" label="Vitamin B12" checked={labTests.vitaminB12} onChange={() => setLabTests({ ...labTests, vitaminB12: !labTests.vitaminB12 })} />
                          <LabCheckbox id="folate" label="Folate" checked={labTests.folate} onChange={() => setLabTests({ ...labTests, folate: !labTests.folate })} />
                          <LabCheckbox id="vitaminD" label="Vitamin D" checked={labTests.vitaminD} onChange={() => setLabTests({ ...labTests, vitaminD: !labTests.vitaminD })} />
                          <LabCheckbox id="crp" label="C-Reactive Protein (CRP)" checked={labTests.crp} onChange={() => setLabTests({ ...labTests, crp: !labTests.crp })} />
                          <LabCheckbox id="procalcitonin" label="Procalcitonin" checked={labTests.procalcitonin} onChange={() => setLabTests({ ...labTests, procalcitonin: !labTests.procalcitonin })} />
                          <LabCheckbox id="troponin" label="Troponin I/T" checked={labTests.troponin} onChange={() => setLabTests({ ...labTests, troponin: !labTests.troponin })} />
                          <LabCheckbox id="bnp" label="BNP/NT-proBNP" checked={labTests.bnp} onChange={() => setLabTests({ ...labTests, bnp: !labTests.bnp })} />
                          <LabCheckbox id="ldh" label="Lactate Dehydrogenase (LDH)" checked={labTests.ldh} onChange={() => setLabTests({ ...labTests, ldh: !labTests.ldh })} />
                          <LabCheckbox id="amylase" label="Amylase" checked={labTests.amylase} onChange={() => setLabTests({ ...labTests, amylase: !labTests.amylase })} />
                          <LabCheckbox id="lipase" label="Lipase" checked={labTests.lipase} onChange={() => setLabTests({ ...labTests, lipase: !labTests.lipase })} />
                          <LabCheckbox id="serumLactate" label="Serum Lactate" checked={labTests.serumLactate} onChange={() => setLabTests({ ...labTests, serumLactate: !labTests.serumLactate })} />
                          <LabCheckbox id="abg" label="Arterial Blood Gas (ABG)" checked={labTests.abg} onChange={() => setLabTests({ ...labTests, abg: !labTests.abg })} />
                          <LabCheckbox id="vbg" label="Venous Blood Gas (VBG)" checked={labTests.vbg} onChange={() => setLabTests({ ...labTests, vbg: !labTests.vbg })} />
                          <LabCheckbox id="spep" label="Serum Protein Electrophoresis" checked={labTests.spep} onChange={() => setLabTests({ ...labTests, spep: !labTests.spep })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherBiochem" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other biochemistry test..." />
                        </div>
                      </div>

                      {/* C. Microbiology */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">C. Microbiology</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="bloodCulture" label="Blood Culture and Sensitivity" checked={labTests.bloodCulture} onChange={() => setLabTests({ ...labTests, bloodCulture: !labTests.bloodCulture })} />
                          <LabCheckbox id="urineMCS" label="Urine MCS" checked={labTests.urineMCS} onChange={() => setLabTests({ ...labTests, urineMCS: !labTests.urineMCS })} />
                          <LabCheckbox id="stoolMCS" label="Stool MCS" checked={labTests.stoolMCS} onChange={() => setLabTests({ ...labTests, stoolMCS: !labTests.stoolMCS })} />
                          <LabCheckbox id="sputumMCS" label="Sputum MCS" checked={labTests.sputumMCS} onChange={() => setLabTests({ ...labTests, sputumMCS: !labTests.sputumMCS })} />
                          <LabCheckbox id="csfMCS" label="CSF MCS" checked={labTests.csfMCS} onChange={() => setLabTests({ ...labTests, csfMCS: !labTests.csfMCS })} />
                          <LabCheckbox id="woundSwabMCS" label="Wound Swab MCS" checked={labTests.woundSwabMCS} onChange={() => setLabTests({ ...labTests, woundSwabMCS: !labTests.woundSwabMCS })} />
                          <LabCheckbox id="throatSwabMCS" label="Throat Swab MCS" checked={labTests.throatSwabMCS} onChange={() => setLabTests({ ...labTests, throatSwabMCS: !labTests.throatSwabMCS })} />
                          <LabCheckbox id="earSwabMCS" label="Ear Swab MCS" checked={labTests.earSwabMCS} onChange={() => setLabTests({ ...labTests, earSwabMCS: !labTests.earSwabMCS })} />
                          <LabCheckbox id="eyeSwabMCS" label="Eye Swab MCS" checked={labTests.eyeSwabMCS} onChange={() => setLabTests({ ...labTests, eyeSwabMCS: !labTests.eyeSwabMCS })} />
                          <LabCheckbox id="hvsMCS" label="High Vaginal Swab MCS" checked={labTests.hvsMCS} onChange={() => setLabTests({ ...labTests, hvsMCS: !labTests.hvsMCS })} />
                          <LabCheckbox id="endocervicalMCS" label="Endocervical Swab MCS" checked={labTests.endocervicalMCS} onChange={() => setLabTests({ ...labTests, endocervicalMCS: !labTests.endocervicalMCS })} />
                          <LabCheckbox id="urethralMCS" label="Urethral Swab MCS" checked={labTests.urethralMCS} onChange={() => setLabTests({ ...labTests, urethralMCS: !labTests.urethralMCS })} />
                          <LabCheckbox id="pusCulture" label="Pus Culture and Sensitivity" checked={labTests.pusCulture} onChange={() => setLabTests({ ...labTests, pusCulture: !labTests.pusCulture })} />
                          <LabCheckbox id="semenCulture" label="Semen Culture" checked={labTests.semenCulture} onChange={() => setLabTests({ ...labTests, semenCulture: !labTests.semenCulture })} />
                          <LabCheckbox id="catheterTipCulture" label="Catheter Tip Culture" checked={labTests.catheterTipCulture} onChange={() => setLabTests({ ...labTests, catheterTipCulture: !labTests.catheterTipCulture })} />
                          <LabCheckbox id="tbTesting" label="Tuberculosis Testing (AFB/GeneXpert)" checked={labTests.tbTesting} onChange={() => setLabTests({ ...labTests, tbTesting: !labTests.tbTesting })} />
                          <LabCheckbox id="hivScreening" label="HIV Screening" checked={labTests.hivScreening} onChange={() => setLabTests({ ...labTests, hivScreening: !labTests.hivScreening })} />
                          <LabCheckbox id="hepBScreening" label="Hepatitis B Screening" checked={labTests.hepBScreening} onChange={() => setLabTests({ ...labTests, hepBScreening: !labTests.hepBScreening })} />
                          <LabCheckbox id="hepCScreening" label="Hepatitis C Screening" checked={labTests.hepCScreening} onChange={() => setLabTests({ ...labTests, hepCScreening: !labTests.hepCScreening })} />
                          <LabCheckbox id="syphilisSerology" label="Syphilis Serology" checked={labTests.syphilisSerology} onChange={() => setLabTests({ ...labTests, syphilisSerology: !labTests.syphilisSerology })} />
                          <LabCheckbox id="covidTesting" label="COVID-19 Testing" checked={labTests.covidTesting} onChange={() => setLabTests({ ...labTests, covidTesting: !labTests.covidTesting })} />
                          <LabCheckbox id="influenzaTesting" label="Influenza Testing" checked={labTests.influenzaTesting} onChange={() => setLabTests({ ...labTests, influenzaTesting: !labTests.influenzaTesting })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherMicro" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other microbiology test..." />
                        </div>
                      </div>

                      {/* D. Mycology */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">D. Mycology</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="fungalMicroscopy" label="Fungal Microscopy" checked={labTests.fungalMicroscopy} onChange={() => setLabTests({ ...labTests, fungalMicroscopy: !labTests.fungalMicroscopy })} />
                          <LabCheckbox id="fungalCulture" label="Fungal Culture" checked={labTests.fungalCulture} onChange={() => setLabTests({ ...labTests, fungalCulture: !labTests.fungalCulture })} />
                          <LabCheckbox id="kohPreparation" label="KOH Preparation" checked={labTests.kohPreparation} onChange={() => setLabTests({ ...labTests, kohPreparation: !labTests.kohPreparation })} />
                          <LabCheckbox id="cryptococcalAntigen" label="Cryptococcal Antigen" checked={labTests.cryptococcalAntigen} onChange={() => setLabTests({ ...labTests, cryptococcalAntigen: !labTests.cryptococcalAntigen })} />
                          <LabCheckbox id="aspergillusAntigen" label="Aspergillus Antigen" checked={labTests.aspergillusAntigen} onChange={() => setLabTests({ ...labTests, aspergillusAntigen: !labTests.aspergillusAntigen })} />
                          <LabCheckbox id="candidaSpeciation" label="Candida Speciation" checked={labTests.candidaSpeciation} onChange={() => setLabTests({ ...labTests, candidaSpeciation: !labTests.candidaSpeciation })} />
                          <LabCheckbox id="fungalSensitivity" label="Fungal Sensitivity Testing" checked={labTests.fungalSensitivity} onChange={() => setLabTests({ ...labTests, fungalSensitivity: !labTests.fungalSensitivity })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherMyco" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other mycology test..." />
                        </div>
                      </div>

                      {/* E. Parasitology */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">E. Parasitology</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="stoolOcp" label="Stool OCP/O&P" checked={labTests.stoolOcp} onChange={() => setLabTests({ ...labTests, stoolOcp: !labTests.stoolOcp })} />
                          <LabCheckbox id="malariaParasite" label="Malaria Parasite Test" checked={labTests.malariaParasite} onChange={() => setLabTests({ ...labTests, malariaParasite: !labTests.malariaParasite })} />
                          <LabCheckbox id="microfilaria" label="Microfilaria Test" checked={labTests.microfilaria} onChange={() => setLabTests({ ...labTests, microfilaria: !labTests.microfilaria })} />
                          <LabCheckbox id="urineSchistosomiasis" label="Urine for Schistosomiasis" checked={labTests.urineSchistosomiasis} onChange={() => setLabTests({ ...labTests, urineSchistosomiasis: !labTests.urineSchistosomiasis })} />
                          <LabCheckbox id="skinSnip" label="Skin Snip for Onchocerciasis" checked={labTests.skinSnip} onChange={() => setLabTests({ ...labTests, skinSnip: !labTests.skinSnip })} />
                          <LabCheckbox id="bloodParasite" label="Blood Parasite Examination" checked={labTests.bloodParasite} onChange={() => setLabTests({ ...labTests, bloodParasite: !labTests.bloodParasite })} />
                          <LabCheckbox id="toxoplasmosis" label="Toxoplasmosis Serology" checked={labTests.toxoplasmosis} onChange={() => setLabTests({ ...labTests, toxoplasmosis: !labTests.toxoplasmosis })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherPara" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other parasitology test..." />
                        </div>
                      </div>

                      {/* F. Histopathology */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">F. Histopathology</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="tissueBiopsyExam" label="Tissue Biopsy Examination" checked={labTests.tissueBiopsyExam} onChange={() => setLabTests({ ...labTests, tissueBiopsyExam: !labTests.tissueBiopsyExam })} />
                          <LabCheckbox id="fnac" label="Fine Needle Aspiration Cytology" checked={labTests.fnac} onChange={() => setLabTests({ ...labTests, fnac: !labTests.fnac })} />
                          <LabCheckbox id="boneMarrowBiopsy" label="Bone Marrow Biopsy" checked={labTests.boneMarrowBiopsy} onChange={() => setLabTests({ ...labTests, boneMarrowBiopsy: !labTests.boneMarrowBiopsy })} />
                          <LabCheckbox id="excisionBiopsy" label="Excision Biopsy" checked={labTests.excisionBiopsy} onChange={() => setLabTests({ ...labTests, excisionBiopsy: !labTests.excisionBiopsy })} />
                          <LabCheckbox id="incisionalBiopsy" label="Incisional Biopsy" checked={labTests.incisionalBiopsy} onChange={() => setLabTests({ ...labTests, incisionalBiopsy: !labTests.incisionalBiopsy })} />
                          <LabCheckbox id="endometrialBiopsy" label="Endometrial Biopsy" checked={labTests.endometrialBiopsy} onChange={() => setLabTests({ ...labTests, endometrialBiopsy: !labTests.endometrialBiopsy })} />
                          <LabCheckbox id="cervicalBiopsy" label="Cervical Biopsy" checked={labTests.cervicalBiopsy} onChange={() => setLabTests({ ...labTests, cervicalBiopsy: !labTests.cervicalBiopsy })} />
                          <LabCheckbox id="giBiopsy" label="Gastrointestinal Biopsy" checked={labTests.giBiopsy} onChange={() => setLabTests({ ...labTests, giBiopsy: !labTests.giBiopsy })} />
                          <LabCheckbox id="skinBiopsy" label="Skin Biopsy" checked={labTests.skinBiopsy} onChange={() => setLabTests({ ...labTests, skinBiopsy: !labTests.skinBiopsy })} />
                          <LabCheckbox id="lymphNodeBiopsy" label="Lymph Node Biopsy" checked={labTests.lymphNodeBiopsy} onChange={() => setLabTests({ ...labTests, lymphNodeBiopsy: !labTests.lymphNodeBiopsy })} />
                          <LabCheckbox id="cytology" label="Cytology (Body Fluids)" checked={labTests.cytology} onChange={() => setLabTests({ ...labTests, cytology: !labTests.cytology })} />
                          <LabCheckbox id="papSmear" label="Pap Smear" checked={labTests.papSmear} onChange={() => setLabTests({ ...labTests, papSmear: !labTests.papSmear })} />
                          <LabCheckbox id="frozenSection" label="Frozen Section" checked={labTests.frozenSection} onChange={() => setLabTests({ ...labTests, frozenSection: !labTests.frozenSection })} />
                          <LabCheckbox id="ihc" label="Immunohistochemistry (IHC)" checked={labTests.ihc} onChange={() => setLabTests({ ...labTests, ihc: !labTests.ihc })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherHisto" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other histopathology test..." />
                        </div>
                      </div>

                      {/* G. Other Laboratory Tests */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">G. Other Laboratory Tests</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <LabCheckbox id="pregnancyTest" label="Pregnancy Test (β-hCG)" checked={labTests.pregnancyTest} onChange={() => setLabTests({ ...labTests, pregnancyTest: !labTests.pregnancyTest })} />
                          <LabCheckbox id="toxicologyScreen" label="Toxicology Screen" checked={labTests.toxicologyScreen} onChange={() => setLabTests({ ...labTests, toxicologyScreen: !labTests.toxicologyScreen })} />
                          <LabCheckbox id="therapeuticDrugMonitoring" label="Therapeutic Drug Monitoring" checked={labTests.therapeuticDrugMonitoring} onChange={() => setLabTests({ ...labTests, therapeuticDrugMonitoring: !labTests.therapeuticDrugMonitoring })} />
                          <LabCheckbox id="autoimmuneScreen" label="Autoimmune Screen" checked={labTests.autoimmuneScreen} onChange={() => setLabTests({ ...labTests, autoimmuneScreen: !labTests.autoimmuneScreen })} />
                          <LabCheckbox id="allergyTesting" label="Allergy Testing" checked={labTests.allergyTesting} onChange={() => setLabTests({ ...labTests, allergyTesting: !labTests.allergyTesting })} />
                          <LabCheckbox id="tumourMarkers" label="Tumour Markers" checked={labTests.tumourMarkers} onChange={() => setLabTests({ ...labTests, tumourMarkers: !labTests.tumourMarkers })} />
                          <LabCheckbox id="geneticTesting" label="Genetic Testing" checked={labTests.geneticTesting} onChange={() => setLabTests({ ...labTests, geneticTesting: !labTests.geneticTesting })} />
                          <LabCheckbox id="newbornScreening" label="Newborn Screening" checked={labTests.newbornScreening} onChange={() => setLabTests({ ...labTests, newbornScreening: !labTests.newbornScreening })} />
                          <LabCheckbox id="occupationalHealth" label="Occupational Health Screening" checked={labTests.occupationalHealth} onChange={() => setLabTests({ ...labTests, occupationalHealth: !labTests.occupationalHealth })} />
                        </div>
                        <div className="mt-1">
                          <LabCheckbox id="otherLab" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other laboratory test..." />
                        </div>
                      </div>
                    </div>

                    {/* Lab Notes */}
                    <div className="border border-border/60 rounded-lg p-4 mt-4">
                      <Label className="text-sm font-semibold">Clinical Notes for Lab</Label>
                      <Textarea rows={3} placeholder="Additional clinical information for the laboratory..." value={labNotes} onChange={(e) => setLabNotes(e.target.value)} className="mt-2" />
                    </div>

                    {/* Doctor Signature for Lab */}
                    <div className="border border-border/60 rounded-lg p-4 bg-muted/5 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Signature className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-semibold">Doctor's Signature</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Signature</Label>
                          <div className="mt-1">
                            {signature ? (
                              <div className="relative">
                                <img src={signature} alt="Doctor's Signature" className="max-h-16 border border-border/60 rounded-lg p-2 bg-white" />
                                <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => setSignature("")}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">Upload signature image</p>
                                <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG</p>
                                <Input type="file" accept="image/*" className="hidden" id="signature-upload-lab" onChange={handleSignatureUpload} />
                                <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => document.getElementById('signature-upload-lab')?.click()}>
                                  <Upload className="h-3 w-3 mr-1" /> Choose File
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Date</Label>
                          <Input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="mt-1" />
                          <p className="text-xs text-muted-foreground mt-2">Lab requisition requires doctor's signature</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/60 mt-4">
                      <Button className="flex-1" onClick={handleSendLabRequisition} disabled={!!actionBusy}>
                        {actionBusy === "lab" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Send to Lab
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Diagnostic Imaging */}
                <TabsContent value="diag" className="space-y-4">
                  <div className="overflow-y-auto max-h-[600px] pr-2">
                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/5 rounded-lg border border-border/60">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Patient Information</p>
                        <p className="font-medium text-sm">{mockPatientData.name}</p>
                        <p className="text-xs text-muted-foreground">DOB: {mockPatientData.dob} • {mockPatientData.gender}</p>
                        <p className="text-xs text-muted-foreground">Patient ID: {mockPatientData.patientId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Physician Information</p>
                        <p className="font-medium text-sm">{mockDoctorData.name}</p>
                        <p className="text-xs text-muted-foreground">{mockDoctorData.specialty}</p>
                        <p className="text-xs text-muted-foreground">License: {mockDoctorData.license}</p>
                      </div>
                    </div>

                    {/* SECTION 2: DIAGNOSTIC IMAGING & PROCEDURES */}
                    <div className="border border-border/60 rounded-lg p-4 bg-primary/5">

                      {/* X-Ray */}
                      <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">X-Ray</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="chestXRay" label="Chest X-Ray" checked={diagnosticTests.chestXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, chestXRay: !diagnosticTests.chestXRay })} />
                          <DiagCheckbox id="abdomenXRay" label="Abdomen X-Ray" checked={diagnosticTests.abdomenXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, abdomenXRay: !diagnosticTests.abdomenXRay })} />
                          <DiagCheckbox id="skullXRay" label="Skull X-Ray" checked={diagnosticTests.skullXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, skullXRay: !diagnosticTests.skullXRay })} />
                          <DiagCheckbox id="cervicalSpineXRay" label="Cervical Spine X-Ray" checked={diagnosticTests.cervicalSpineXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, cervicalSpineXRay: !diagnosticTests.cervicalSpineXRay })} />
                          <DiagCheckbox id="thoracicSpineXRay" label="Thoracic Spine X-Ray" checked={diagnosticTests.thoracicSpineXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, thoracicSpineXRay: !diagnosticTests.thoracicSpineXRay })} />
                          <DiagCheckbox id="lumbarSpineXRay" label="Lumbar Spine X-Ray" checked={diagnosticTests.lumbarSpineXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, lumbarSpineXRay: !diagnosticTests.lumbarSpineXRay })} />
                          <DiagCheckbox id="pelvisXRay" label="Pelvis X-Ray" checked={diagnosticTests.pelvisXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, pelvisXRay: !diagnosticTests.pelvisXRay })} />
                          <DiagCheckbox id="upperLimbXRay" label="Upper Limb X-Ray" checked={diagnosticTests.upperLimbXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, upperLimbXRay: !diagnosticTests.upperLimbXRay })} />
                          <DiagCheckbox id="lowerLimbXRay" label="Lower Limb X-Ray" checked={diagnosticTests.lowerLimbXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, lowerLimbXRay: !diagnosticTests.lowerLimbXRay })} />
                          <DiagCheckbox id="facialBonesXRay" label="Facial Bones X-Ray" checked={diagnosticTests.facialBonesXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, facialBonesXRay: !diagnosticTests.facialBonesXRay })} />
                          <DiagCheckbox id="sinusesXRay" label="Sinuses X-Ray" checked={diagnosticTests.sinusesXRay} onChange={() => setDiagnosticTests({ ...diagnosticTests, sinusesXRay: !diagnosticTests.sinusesXRay })} />
                          <DiagCheckbox id="skeletalSurvey" label="Skeletal Survey" checked={diagnosticTests.skeletalSurvey} onChange={() => setDiagnosticTests({ ...diagnosticTests, skeletalSurvey: !diagnosticTests.skeletalSurvey })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherXRay" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other X-Ray..." value={diagnosticTests.otherXRay} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherXRay: e.target.value })} />
                        </div>
                      </div>

                      {/* CT Scan */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">CT Scan</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="ctBrain" label="CT Brain" checked={diagnosticTests.ctBrain} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctBrain: !diagnosticTests.ctBrain })} />
                          <DiagCheckbox id="ctNeck" label="CT Neck" checked={diagnosticTests.ctNeck} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctNeck: !diagnosticTests.ctNeck })} />
                          <DiagCheckbox id="ctChest" label="CT Chest" checked={diagnosticTests.ctChest} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctChest: !diagnosticTests.ctChest })} />
                          <DiagCheckbox id="ctAbdomen" label="CT Abdomen" checked={diagnosticTests.ctAbdomen} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctAbdomen: !diagnosticTests.ctAbdomen })} />
                          <DiagCheckbox id="ctPelvis" label="CT Pelvis" checked={diagnosticTests.ctPelvis} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctPelvis: !diagnosticTests.ctPelvis })} />
                          <DiagCheckbox id="ctAbdomenPelvis" label="CT Abdomen and Pelvis" checked={diagnosticTests.ctAbdomenPelvis} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctAbdomenPelvis: !diagnosticTests.ctAbdomenPelvis })} />
                          <DiagCheckbox id="ctPA" label="CT Pulmonary Angiography (CTPA)" checked={diagnosticTests.ctPA} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctPA: !diagnosticTests.ctPA })} />
                          <DiagCheckbox id="ctCA" label="CT Coronary Angiography (CTCA)" checked={diagnosticTests.ctCA} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctCA: !diagnosticTests.ctCA })} />
                          <DiagCheckbox id="ctSpine" label="CT Spine" checked={diagnosticTests.ctSpine} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctSpine: !diagnosticTests.ctSpine })} />
                          <DiagCheckbox id="ctAngiography" label="CT Angiography" checked={diagnosticTests.ctAngiography} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctAngiography: !diagnosticTests.ctAngiography })} />
                          <DiagCheckbox id="ctUrogram" label="CT Urogram" checked={diagnosticTests.ctUrogram} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctUrogram: !diagnosticTests.ctUrogram })} />
                          <DiagCheckbox id="ctGuided" label="CT-Guided Procedure" checked={diagnosticTests.ctGuided} onChange={() => setDiagnosticTests({ ...diagnosticTests, ctGuided: !diagnosticTests.ctGuided })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherCT" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other CT..." value={diagnosticTests.otherCT} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherCT: e.target.value })} />
                        </div>
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Contrast:</p>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id="ctContrastWith" checked={diagnosticTests.ctContrast === "with"} onCheckedChange={() => setDiagnosticTests({ ...diagnosticTests, ctContrast: "with" })} className="h-3.5 w-3.5" />
                              <Label htmlFor="ctContrastWith" className="text-xs cursor-pointer">With Contrast</Label>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id="ctContrastWithout" checked={diagnosticTests.ctContrast === "without"} onCheckedChange={() => setDiagnosticTests({ ...diagnosticTests, ctContrast: "without" })} className="h-3.5 w-3.5" />
                              <Label htmlFor="ctContrastWithout" className="text-xs cursor-pointer">Without Contrast</Label>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id="ctContrastDetermined" checked={diagnosticTests.ctContrast === "determined"} onCheckedChange={() => setDiagnosticTests({ ...diagnosticTests, ctContrast: "determined" })} className="h-3.5 w-3.5" />
                              <Label htmlFor="ctContrastDetermined" className="text-xs cursor-pointer">As Determined by Radiologist</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* MRI */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">MRI</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="mriBrain" label="MRI Brain" checked={diagnosticTests.mriBrain} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriBrain: !diagnosticTests.mriBrain })} />
                          <DiagCheckbox id="mriSpine" label="MRI Spine" checked={diagnosticTests.mriSpine} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriSpine: !diagnosticTests.mriSpine })} />
                          <DiagCheckbox id="mriAbdomen" label="MRI Abdomen" checked={diagnosticTests.mriAbdomen} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriAbdomen: !diagnosticTests.mriAbdomen })} />
                          <DiagCheckbox id="mriPelvis" label="MRI Pelvis" checked={diagnosticTests.mriPelvis} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriPelvis: !diagnosticTests.mriPelvis })} />
                          <DiagCheckbox id="mriShoulder" label="MRI Shoulder" checked={diagnosticTests.mriShoulder} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriShoulder: !diagnosticTests.mriShoulder })} />
                          <DiagCheckbox id="mriKnee" label="MRI Knee" checked={diagnosticTests.mriKnee} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriKnee: !diagnosticTests.mriKnee })} />
                          <DiagCheckbox id="mriLiver" label="MRI Liver" checked={diagnosticTests.mriLiver} onChange={() => setDiagnosticTests({ ...diagnosticTests, mriLiver: !diagnosticTests.mriLiver })} />
                          <DiagCheckbox id="mrcp" label="MRCP" checked={diagnosticTests.mrcp} onChange={() => setDiagnosticTests({ ...diagnosticTests, mrcp: !diagnosticTests.mrcp })} />
                          <DiagCheckbox id="mra" label="MRA" checked={diagnosticTests.mra} onChange={() => setDiagnosticTests({ ...diagnosticTests, mra: !diagnosticTests.mra })} />
                          <DiagCheckbox id="cardiacMRI" label="Cardiac MRI" checked={diagnosticTests.cardiacMRI} onChange={() => setDiagnosticTests({ ...diagnosticTests, cardiacMRI: !diagnosticTests.cardiacMRI })} />
                          <DiagCheckbox id="breastMRI" label="Breast MRI" checked={diagnosticTests.breastMRI} onChange={() => setDiagnosticTests({ ...diagnosticTests, breastMRI: !diagnosticTests.breastMRI })} />
                          <DiagCheckbox id="prostateMRI" label="Prostate MRI" checked={diagnosticTests.prostateMRI} onChange={() => setDiagnosticTests({ ...diagnosticTests, prostateMRI: !diagnosticTests.prostateMRI })} />
                          <DiagCheckbox id="wholeBodyMRI" label="Whole Body MRI" checked={diagnosticTests.wholeBodyMRI} onChange={() => setDiagnosticTests({ ...diagnosticTests, wholeBodyMRI: !diagnosticTests.wholeBodyMRI })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherMRI" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other MRI..." value={diagnosticTests.otherMRI} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherMRI: e.target.value })} />
                        </div>
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Contrast:</p>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id="mriContrastWith" checked={diagnosticTests.mriContrast === "with"} onCheckedChange={() => setDiagnosticTests({ ...diagnosticTests, mriContrast: "with" })} className="h-3.5 w-3.5" />
                              <Label htmlFor="mriContrastWith" className="text-xs cursor-pointer">With Contrast</Label>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id="mriContrastWithout" checked={diagnosticTests.mriContrast === "without"} onCheckedChange={() => setDiagnosticTests({ ...diagnosticTests, mriContrast: "without" })} className="h-3.5 w-3.5" />
                              <Label htmlFor="mriContrastWithout" className="text-xs cursor-pointer">Without Contrast</Label>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id="mriContrastDetermined" checked={diagnosticTests.mriContrast === "determined"} onCheckedChange={() => setDiagnosticTests({ ...diagnosticTests, mriContrast: "determined" })} className="h-3.5 w-3.5" />
                              <Label htmlFor="mriContrastDetermined" className="text-xs cursor-pointer">As Determined by Radiologist</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ultrasound */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Ultrasound</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="usAbdomen" label="Abdomen" checked={diagnosticTests.usAbdomen} onChange={() => setDiagnosticTests({ ...diagnosticTests, usAbdomen: !diagnosticTests.usAbdomen })} />
                          <DiagCheckbox id="usPelvis" label="Pelvis" checked={diagnosticTests.usPelvis} onChange={() => setDiagnosticTests({ ...diagnosticTests, usPelvis: !diagnosticTests.usPelvis })} />
                          <DiagCheckbox id="usAbdomenPelvis" label="Abdomen and Pelvis" checked={diagnosticTests.usAbdomenPelvis} onChange={() => setDiagnosticTests({ ...diagnosticTests, usAbdomenPelvis: !diagnosticTests.usAbdomenPelvis })} />
                          <DiagCheckbox id="usHepatobiliary" label="Hepatobiliary System" checked={diagnosticTests.usHepatobiliary} onChange={() => setDiagnosticTests({ ...diagnosticTests, usHepatobiliary: !diagnosticTests.usHepatobiliary })} />
                          <DiagCheckbox id="usRenal" label="Renal Tract/KUB" checked={diagnosticTests.usRenal} onChange={() => setDiagnosticTests({ ...diagnosticTests, usRenal: !diagnosticTests.usRenal })} />
                          <DiagCheckbox id="usObstetric" label="Obstetric Ultrasound" checked={diagnosticTests.usObstetric} onChange={() => setDiagnosticTests({ ...diagnosticTests, usObstetric: !diagnosticTests.usObstetric })} />
                          <DiagCheckbox id="usTransvaginal" label="Transvaginal Ultrasound" checked={diagnosticTests.usTransvaginal} onChange={() => setDiagnosticTests({ ...diagnosticTests, usTransvaginal: !diagnosticTests.usTransvaginal })} />
                          <DiagCheckbox id="usScrotal" label="Scrotal Ultrasound" checked={diagnosticTests.usScrotal} onChange={() => setDiagnosticTests({ ...diagnosticTests, usScrotal: !diagnosticTests.usScrotal })} />
                          <DiagCheckbox id="usProstate" label="Prostate Ultrasound" checked={diagnosticTests.usProstate} onChange={() => setDiagnosticTests({ ...diagnosticTests, usProstate: !diagnosticTests.usProstate })} />
                          <DiagCheckbox id="usThyroid" label="Thyroid Ultrasound" checked={diagnosticTests.usThyroid} onChange={() => setDiagnosticTests({ ...diagnosticTests, usThyroid: !diagnosticTests.usThyroid })} />
                          <DiagCheckbox id="usBreast" label="Breast Ultrasound" checked={diagnosticTests.usBreast} onChange={() => setDiagnosticTests({ ...diagnosticTests, usBreast: !diagnosticTests.usBreast })} />
                          <DiagCheckbox id="usSoftTissue" label="Soft Tissue Ultrasound" checked={diagnosticTests.usSoftTissue} onChange={() => setDiagnosticTests({ ...diagnosticTests, usSoftTissue: !diagnosticTests.usSoftTissue })} />
                          <DiagCheckbox id="usNeck" label="Neck Ultrasound" checked={diagnosticTests.usNeck} onChange={() => setDiagnosticTests({ ...diagnosticTests, usNeck: !diagnosticTests.usNeck })} />
                          <DiagCheckbox id="usVenousDoppler" label="Venous Doppler" checked={diagnosticTests.usVenousDoppler} onChange={() => setDiagnosticTests({ ...diagnosticTests, usVenousDoppler: !diagnosticTests.usVenousDoppler })} />
                          <DiagCheckbox id="usArterialDoppler" label="Arterial Doppler" checked={diagnosticTests.usArterialDoppler} onChange={() => setDiagnosticTests({ ...diagnosticTests, usArterialDoppler: !diagnosticTests.usArterialDoppler })} />
                          <DiagCheckbox id="usCarotidDoppler" label="Carotid Doppler" checked={diagnosticTests.usCarotidDoppler} onChange={() => setDiagnosticTests({ ...diagnosticTests, usCarotidDoppler: !diagnosticTests.usCarotidDoppler })} />
                          <DiagCheckbox id="usEchocardiography" label="Echocardiography" checked={diagnosticTests.usEchocardiography} onChange={() => setDiagnosticTests({ ...diagnosticTests, usEchocardiography: !diagnosticTests.usEchocardiography })} />
                          <DiagCheckbox id="usFAST" label="FAST Scan" checked={diagnosticTests.usFAST} onChange={() => setDiagnosticTests({ ...diagnosticTests, usFAST: !diagnosticTests.usFAST })} />
                          <DiagCheckbox id="usGuidedAspiration" label="Ultrasound-Guided Aspiration/Biopsy" checked={diagnosticTests.usGuidedAspiration} onChange={() => setDiagnosticTests({ ...diagnosticTests, usGuidedAspiration: !diagnosticTests.usGuidedAspiration })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherUS" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other Ultrasound..." value={diagnosticTests.otherUS} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherUS: e.target.value })} />
                        </div>
                      </div>

                      {/* Endoscopy */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Endoscopy</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="gastroscopy" label="Gastroscopy (OGD)" checked={diagnosticTests.gastroscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, gastroscopy: !diagnosticTests.gastroscopy })} />
                          <DiagCheckbox id="colonoscopy" label="Colonoscopy" checked={diagnosticTests.colonoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, colonoscopy: !diagnosticTests.colonoscopy })} />
                          <DiagCheckbox id="flexibleSigmoidoscopy" label="Flexible Sigmoidoscopy" checked={diagnosticTests.flexibleSigmoidoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, flexibleSigmoidoscopy: !diagnosticTests.flexibleSigmoidoscopy })} />
                          <DiagCheckbox id="proctoscopy" label="Proctoscopy" checked={diagnosticTests.proctoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, proctoscopy: !diagnosticTests.proctoscopy })} />
                          <DiagCheckbox id="ercp" label="ERCP" checked={diagnosticTests.ercp} onChange={() => setDiagnosticTests({ ...diagnosticTests, ercp: !diagnosticTests.ercp })} />
                          <DiagCheckbox id="capsuleEndoscopy" label="Capsule Endoscopy" checked={diagnosticTests.capsuleEndoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, capsuleEndoscopy: !diagnosticTests.capsuleEndoscopy })} />
                          <DiagCheckbox id="enteroscopy" label="Enteroscopy" checked={diagnosticTests.enteroscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, enteroscopy: !diagnosticTests.enteroscopy })} />
                          <DiagCheckbox id="endoscopicUltrasound" label="Endoscopic Ultrasound" checked={diagnosticTests.endoscopicUltrasound} onChange={() => setDiagnosticTests({ ...diagnosticTests, endoscopicUltrasound: !diagnosticTests.endoscopicUltrasound })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherEndoscopy" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other Endoscopy..." value={diagnosticTests.otherEndoscopy} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherEndoscopy: e.target.value })} />
                        </div>
                      </div>

                      {/* Bronchoscopy */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bronchoscopy</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="flexibleBronchoscopy" label="Flexible Bronchoscopy" checked={diagnosticTests.flexibleBronchoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, flexibleBronchoscopy: !diagnosticTests.flexibleBronchoscopy })} />
                          <DiagCheckbox id="rigidBronchoscopy" label="Rigid Bronchoscopy" checked={diagnosticTests.rigidBronchoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, rigidBronchoscopy: !diagnosticTests.rigidBronchoscopy })} />
                          <DiagCheckbox id="balBronchoscopy" label="Bronchoalveolar Lavage (BAL)" checked={diagnosticTests.balBronchoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, balBronchoscopy: !diagnosticTests.balBronchoscopy })} />
                          <DiagCheckbox id="endobronchialBiopsy" label="Endobronchial Biopsy" checked={diagnosticTests.endobronchialBiopsy} onChange={() => setDiagnosticTests({ ...diagnosticTests, endobronchialBiopsy: !diagnosticTests.endobronchialBiopsy })} />
                          <DiagCheckbox id="transbronchialBiopsy" label="Transbronchial Biopsy" checked={diagnosticTests.transbronchialBiopsy} onChange={() => setDiagnosticTests({ ...diagnosticTests, transbronchialBiopsy: !diagnosticTests.transbronchialBiopsy })} />
                          <DiagCheckbox id="ebus" label="Endobronchial Ultrasound (EBUS)" checked={diagnosticTests.ebus} onChange={() => setDiagnosticTests({ ...diagnosticTests, ebus: !diagnosticTests.ebus })} />
                          <DiagCheckbox id="foreignBodyRemoval" label="Foreign Body Removal" checked={diagnosticTests.foreignBodyRemoval} onChange={() => setDiagnosticTests({ ...diagnosticTests, foreignBodyRemoval: !diagnosticTests.foreignBodyRemoval })} />
                          <DiagCheckbox id="therapeuticBronchoscopy" label="Therapeutic Bronchoscopy" checked={diagnosticTests.therapeuticBronchoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, therapeuticBronchoscopy: !diagnosticTests.therapeuticBronchoscopy })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherBronchoscopy" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other Bronchoscopy..." value={diagnosticTests.otherBronchoscopy} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherBronchoscopy: e.target.value })} />
                        </div>
                      </div>

                      {/* Colposcopy */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Colposcopy</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="diagnosticColposcopy" label="Diagnostic Colposcopy" checked={diagnosticTests.diagnosticColposcopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, diagnosticColposcopy: !diagnosticTests.diagnosticColposcopy })} />
                          <DiagCheckbox id="colposcopyBiopsy" label="Colposcopy with Biopsy" checked={diagnosticTests.colposcopyBiopsy} onChange={() => setDiagnosticTests({ ...diagnosticTests, colposcopyBiopsy: !diagnosticTests.colposcopyBiopsy })} />
                          <DiagCheckbox id="colposcopyECC" label="Colposcopy with Endocervical Curettage" checked={diagnosticTests.colposcopyECC} onChange={() => setDiagnosticTests({ ...diagnosticTests, colposcopyECC: !diagnosticTests.colposcopyECC })} />
                          <DiagCheckbox id="colposcopyDirectedBiopsy" label="Colposcopy with Directed Biopsy" checked={diagnosticTests.colposcopyDirectedBiopsy} onChange={() => setDiagnosticTests({ ...diagnosticTests, colposcopyDirectedBiopsy: !diagnosticTests.colposcopyDirectedBiopsy })} />
                          <DiagCheckbox id="colposcopyTreatment" label="Colposcopy with Treatment (LLETZ/LEEP)" checked={diagnosticTests.colposcopyTreatment} onChange={() => setDiagnosticTests({ ...diagnosticTests, colposcopyTreatment: !diagnosticTests.colposcopyTreatment })} />
                          <DiagCheckbox id="followUpColposcopy" label="Follow-up Colposcopy" checked={diagnosticTests.followUpColposcopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, followUpColposcopy: !diagnosticTests.followUpColposcopy })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherColposcopy" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other Colposcopy..." value={diagnosticTests.otherColposcopy} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherColposcopy: e.target.value })} />
                        </div>
                      </div>

                      {/* Other Diagnostic Procedures */}
                      <div className="mb-4 border-t border-border/60 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Other Diagnostic Procedures</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          <DiagCheckbox id="fluoroscopy" label="Fluoroscopy" checked={diagnosticTests.fluoroscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, fluoroscopy: !diagnosticTests.fluoroscopy })} />
                          <DiagCheckbox id="mammography" label="Mammography" checked={diagnosticTests.mammography} onChange={() => setDiagnosticTests({ ...diagnosticTests, mammography: !diagnosticTests.mammography })} />
                          <DiagCheckbox id="dexa" label="Bone Mineral Density (DEXA)" checked={diagnosticTests.dexa} onChange={() => setDiagnosticTests({ ...diagnosticTests, dexa: !diagnosticTests.dexa })} />
                          <DiagCheckbox id="nuclearMedicine" label="Nuclear Medicine Scan" checked={diagnosticTests.nuclearMedicine} onChange={() => setDiagnosticTests({ ...diagnosticTests, nuclearMedicine: !diagnosticTests.nuclearMedicine })} />
                          <DiagCheckbox id="petCT" label="PET-CT" checked={diagnosticTests.petCT} onChange={() => setDiagnosticTests({ ...diagnosticTests, petCT: !diagnosticTests.petCT })} />
                          <DiagCheckbox id="hysteroscopy" label="Hysteroscopy" checked={diagnosticTests.hysteroscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, hysteroscopy: !diagnosticTests.hysteroscopy })} />
                          <DiagCheckbox id="cystoscopy" label="Cystoscopy" checked={diagnosticTests.cystoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, cystoscopy: !diagnosticTests.cystoscopy })} />
                          <DiagCheckbox id="laryngoscopy" label="Laryngoscopy" checked={diagnosticTests.laryngoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, laryngoscopy: !diagnosticTests.laryngoscopy })} />
                          <DiagCheckbox id="flexibleNasoendoscopy" label="Flexible Nasoendoscopy" checked={diagnosticTests.flexibleNasoendoscopy} onChange={() => setDiagnosticTests({ ...diagnosticTests, flexibleNasoendoscopy: !diagnosticTests.flexibleNasoendoscopy })} />
                          <DiagCheckbox id="angiography" label="Angiography" checked={diagnosticTests.angiography} onChange={() => setDiagnosticTests({ ...diagnosticTests, angiography: !diagnosticTests.angiography })} />
                        </div>
                        <div className="mt-1">
                          <DiagCheckbox id="otherProcedure" label="Other:" checked={false} onChange={() => {}} />
                          <Input className="h-8 text-xs mt-1" placeholder="Specify other procedure..." value={diagnosticTests.otherProcedure} onChange={(e) => setDiagnosticTests({ ...diagnosticTests, otherProcedure: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* Clinical Notes for Diagnostic */}
                    <div className="border border-border/60 rounded-lg p-4 mt-4">
                      <Label className="text-sm font-semibold">Clinical Notes for Diagnostic Imaging</Label>
                      <Textarea rows={3} placeholder="Additional clinical information for the imaging department..." className="mt-2" />
                    </div>

                    {/* Doctor Signature for Diagnostic */}
                    <div className="border border-border/60 rounded-lg p-4 bg-muted/5 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Signature className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-semibold">Doctor's Signature</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Signature</Label>
                          <div className="mt-1">
                            {signature ? (
                              <div className="relative">
                                <img src={signature} alt="Doctor's Signature" className="max-h-16 border border-border/60 rounded-lg p-2 bg-white" />
                                <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => setSignature("")}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">Upload signature image</p>
                                <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG</p>
                                <Input type="file" accept="image/*" className="hidden" id="signature-upload-diag" onChange={handleSignatureUpload} />
                                <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => document.getElementById('signature-upload-diag')?.click()}>
                                  <Upload className="h-3 w-3 mr-1" /> Choose File
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Date</Label>
                          <Input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="mt-1" />
                          <p className="text-xs text-muted-foreground mt-2">Diagnostic imaging request requires doctor's signature</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/60 mt-4">
                      <Button className="flex-1" onClick={handleSendDiagnosticRequest} disabled={!!actionBusy}>
                        {actionBusy === "diagnostic" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Send Request
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Referral */}
                <TabsContent value="ref" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Specialist">
                      <Select value={referralSpecialist} onValueChange={setReferralSpecialist}>
                        <SelectTrigger><SelectValue placeholder="Select specialist" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardiologist</SelectItem>
                          <SelectItem value="derm">Dermatologist</SelectItem>
                          <SelectItem value="endo">Endocrinologist</SelectItem>
                          <SelectItem value="neuro">Neurologist</SelectItem>
                          <SelectItem value="ortho">Orthopedic Surgeon</SelectItem>
                          <SelectItem value="psych">Psychiatrist</SelectItem>
                          <SelectItem value="nephro">Nephrologist</SelectItem>
                          <SelectItem value="onco">Oncologist</SelectItem>
                          <SelectItem value="ophth">Ophthalmologist</SelectItem>
                          <SelectItem value="ent">ENT Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Facility">
                      <Select value={referralFacility} onValueChange={setReferralFacility}>
                        <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luth">Lagos University Teaching Hospital</SelectItem>
                          <SelectItem value="nha">National Hospital Abuja</SelectItem>
                          <SelectItem value="eko">Eko Hospital</SelectItem>
                          <SelectItem value="reddington">Reddington Hospital</SelectItem>
                          <SelectItem value="lagos-island">Lagos Island General Hospital</SelectItem>
                          <SelectItem value="st-nicholas">St. Nicholas Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Reason for Referral">
                    <Textarea rows={4} value={referralReason} onChange={(e) => setReferralReason(e.target.value)} placeholder="Patient with chest pain, refer for stress test. Include relevant history and findings..." />
                  </Field>
                  <Field label="Additional Notes">
                    <Textarea rows={3} value={referralNotes} onChange={(e) => setReferralNotes(e.target.value)} placeholder="Any other relevant information for the specialist..." />
                  </Field>
                  
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Signature className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Doctor's Signature</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Signature</Label>
                        <div className="mt-1">
                          {signature ? (
                            <div className="relative">
                              <img src={signature} alt="Doctor's Signature" className="max-h-16 border border-border/60 rounded-lg p-2 bg-white" />
                              <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => setSignature("")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground">Upload signature image</p>
                              <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG</p>
                              <Input type="file" accept="image/*" className="hidden" id="signature-upload-ref" onChange={handleSignatureUpload} />
                              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => document.getElementById('signature-upload-ref')?.click()}>
                                <Upload className="h-3 w-3 mr-1" /> Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <Input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-2">Referral requires doctor's signature</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={handleSendReferral} disabled={!!actionBusy}>
                      {actionBusy === "referral" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Send Referral
                    </Button>
                    <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" /> Download</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ConsultationRoom;
