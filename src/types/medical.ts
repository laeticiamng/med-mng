// ==========================================
// MED-MNG MEDICAL TYPES - Architecture centralisée
// ==========================================

export interface MedicalItem {
  id: string;
  item_code: string;
  title: string;
  description?: string;
  category: MedicalCategory;
  competencies: Competency[];
  difficulty_level: 'R1' | 'R2' | 'R3' | 'Senior' | 'Expert';
  estimated_study_time: number; // minutes
  prerequisites?: string[];
  learning_objectives: string[];
  tags: string[];
  metadata: MedicalItemMetadata;
}

export interface MedicalItemMetadata {
  speciality: MedicalSpecialty;
  last_updated: string;
  version: string;
  author: string;
  validation_status: 'draft' | 'reviewed' | 'validated' | 'deprecated';
  usage_stats: UsageStats;
}

export interface UsageStats {
  total_generations: number;
  avg_completion_rate: number;
  user_feedback_score: number;
  last_accessed: string;
}

export type MedicalCategory = 
  | 'IC1' | 'IC2' | 'IC3' | 'IC4' | 'IC5'
  | 'ECOS' | 'Clinical_Cases' | 'Pathophysiology' 
  | 'Therapeutics' | 'Diagnosis' | 'Prevention';

export type MedicalSpecialty = 
  | 'Cardiology' | 'Pulmonology' | 'Neurology' 
  | 'Gastroenterology' | 'Endocrinology' | 'Nephrology'
  | 'Hematology' | 'Oncology' | 'Infectious_Diseases'
  | 'Emergency_Medicine' | 'Internal_Medicine' | 'Pediatrics'
  | 'Geriatrics' | 'Psychiatry' | 'Surgery' | 'Radiology'
  | 'Anesthesiology' | 'Pathology' | 'Public_Health';

export interface Competency {
  id: string;
  code: string;
  title: string;
  description: string;
  level: CompetencyLevel;
  domain: CompetencyDomain;
  assessment_criteria: string[];
}

export type CompetencyLevel = 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

export type CompetencyDomain = 
  | 'Knowledge' | 'Clinical_Skills' | 'Communication'
  | 'Professionalism' | 'System_Based_Practice' 
  | 'Practice_Based_Learning' | 'Critical_Thinking';

export interface EcosScenario {
  id: string;
  title: string;
  description: string;
  scenario_type: EcosType;
  patient_info: PatientInfo;
  stations: EcosStation[];
  assessment_grid: AssessmentCriteria[];
  duration_minutes: number;
  difficulty_level: 'R1' | 'R2' | 'R3' | 'Senior';
  learning_objectives: string[];
  medical_concepts: string[];
}

export type EcosType = 
  | 'Clinical_Examination' | 'Diagnostic_Reasoning'
  | 'Therapeutic_Decision' | 'Communication_Skills'
  | 'Emergency_Management' | 'Procedure_Skills';

export interface PatientInfo {
  age: number;
  gender: 'M' | 'F' | 'Other';
  chief_complaint: string;
  history_of_present_illness: string;
  past_medical_history: string[];
  medications: string[];
  allergies: string[];
  social_history: string;
  family_history: string;
  vital_signs: VitalSigns;
}

export interface VitalSigns {
  temperature: number;
  blood_pressure: string;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  pain_score?: number;
}

export interface EcosStation {
  id: string;
  station_number: number;
  title: string;
  instructions: string;
  time_limit_minutes: number;
  required_actions: string[];
  assessment_points: AssessmentPoint[];
  materials_needed: string[];
}

export interface AssessmentPoint {
  id: string;
  description: string;
  points_possible: number;
  competency_assessed: string;
  assessment_level: 'Not_Done' | 'Partially_Done' | 'Adequately_Done' | 'Well_Done';
}

export interface AssessmentCriteria {
  category: string;
  criteria: AssessmentPoint[];
  weight_percentage: number;
  minimum_score: number;
}

// Learning Progress Tracking
export interface LearningProgress {
  user_id: string;
  item_code: string;
  progress_percentage: number;
  competencies_mastered: string[];
  weak_areas: string[];
  study_time_spent: number;
  last_accessed: string;
  performance_metrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  accuracy_rate: number;
  response_time_avg: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
  mastery_level: CompetencyLevel;
  recommendations: string[];
}

// User Profile in Medical Context
export interface MedicalUserProfile {
  user_id: string;
  medical_level: 'Medical_Student' | 'Resident' | 'Fellow' | 'Attending' | 'Nurse' | 'Other';
  year_of_training?: number;
  specialty?: MedicalSpecialty;
  institution?: string;
  learning_preferences: LearningPreferences;
  performance_summary: PerformanceSummary;
}

export interface LearningPreferences {
  preferred_learning_style: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading';
  study_session_duration: number;
  preferred_difficulty_progression: 'Linear' | 'Adaptive' | 'Challenge_Based';
  feedback_frequency: 'Immediate' | 'Session_End' | 'Weekly' | 'Monthly';
  gamification_enabled: boolean;
}

export interface PerformanceSummary {
  overall_score: number;
  strengths: MedicalSpecialty[];
  areas_for_improvement: MedicalSpecialty[];
  study_streak_days: number;
  total_study_hours: number;
  certifications_earned: string[];
  recent_achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  points_awarded: number;
  category: 'Knowledge' | 'Consistency' | 'Improvement' | 'Special';
}