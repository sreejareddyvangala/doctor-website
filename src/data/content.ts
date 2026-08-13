import type { IconType } from 'react-icons';
import {
  TbStethoscope,
  TbReportMedical,
  TbClipboardList,
  TbActivityHeartbeat,
  TbHeartHandshake,
  TbCalendarCheck,
  TbAward,
  TbUserHeart,
  TbMicroscope,
  TbBook,
  TbShieldCheck,
  TbRefresh,
} from 'react-icons/tb';

/* ------------------------------------------------------------------ *
 * Trust statistics
 * ------------------------------------------------------------------ */

export interface Stat {
  /** Numeric target for the count-up. Omit for non-numeric stats. */
  value?: number;
  prefix?: string;
  suffix?: string;
  /** Text shown instead of a counter for qualitative stats. */
  display?: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 15, suffix: '+', label: 'Years of Experience' },
  { value: 10000, suffix: '+', label: 'Patients Treated' },
  { display: 'Expert', label: 'Orthopedic Care' },
  { display: 'Patient-Centered', label: 'Treatment' },
];

/* ------------------------------------------------------------------ *
 * Qualifications
 * ------------------------------------------------------------------ */

export interface Qualification {
  degree: string;
  institution?: string;
  location: string;
}

/** Exactly as supplied — no invented degrees, years or affiliations. */
export const qualifications: Qualification[] = [
  {
    degree: 'Fellowship in Arthroplasty',
    location: 'Hyderabad, India',
  },
  {
    degree: 'DNB Orthopedics',
    institution: 'Sri Sathya Sai Institute of Higher Medical Sciences',
    location: 'Puttaparthi, Andhra Pradesh',
  },
  {
    degree: 'D. Ortho',
    institution: 'Chalmeda Anand Rao Institute of Medical Sciences',
    location: 'Karimnagar, Telangana',
  },
  {
    degree: 'MBBS',
    institution: 'MNR Medical College',
    location: 'Telangana',
  },
];

/* ------------------------------------------------------------------ *
 * Conditions treated
 * ------------------------------------------------------------------ */

export interface Condition {
  name: string;
  description: string;
}

export const conditions: Condition[] = [
  {
    name: 'Knee Pain',
    description:
      'Pain, swelling or stiffness in the knee affecting walking, stairs or standing, assessed to identify the underlying cause.',
  },
  {
    name: 'Hip Pain',
    description:
      'Groin, hip or thigh pain that limits walking, sitting or sleep, evaluated through examination and imaging.',
  },
  {
    name: 'Joint Degeneration',
    description:
      'Progressive wear of joint surfaces, including arthritis, managed with non-surgical care or surgery where appropriate.',
  },
  {
    name: 'Fractures',
    description:
      'Broken bones from falls, road traffic accidents or sports, treated with immobilisation or surgical fixation as indicated.',
  },
  {
    name: 'Dislocations',
    description:
      'Joints displaced out of normal position following injury, requiring prompt assessment and appropriate management.',
  },
  {
    name: 'Sports-Related Orthopedic Injuries',
    description:
      'Injuries to joints, ligaments and cartilage sustained during sport, assessed for both recovery and return to activity.',
  },
  {
    name: 'Complex Trauma Injuries',
    description:
      'Severe or multi-site injuries needing detailed planning, specialised fixation and staged treatment.',
  },
  {
    name: 'Joint Stiffness',
    description:
      'Reduced range of movement following injury, surgery or joint disease, evaluated to guide treatment and rehabilitation.',
  },
  {
    name: 'Mobility-Related Orthopedic Conditions',
    description:
      'Conditions of bones and joints that affect walking, balance and independence in daily activity.',
  },
];

/* ------------------------------------------------------------------ *
 * Why choose
 * ------------------------------------------------------------------ */

export interface Highlight {
  title: string;
  description: string;
  icon: IconType;
}

export const whyChoose: Highlight[] = [
  {
    title: '15+ Years Experience',
    description:
      'Over fifteen years of clinical practice in orthopedic trauma and arthroplasty, across a wide range of presentations.',
    icon: TbAward,
  },
  {
    title: 'Patient-Centered Care',
    description:
      'Time taken to explain the condition, the available options and what each one involves, so decisions are made together.',
    icon: TbUserHeart,
  },
  {
    title: 'Advanced Surgical Techniques',
    description:
      'Use of contemporary surgical methods and implant systems, selected to suit the individual patient and injury pattern.',
    icon: TbMicroscope,
  },
  {
    title: 'Evidence-Based Treatment',
    description:
      'Treatment planning guided by current orthopedic evidence and established clinical practice.',
    icon: TbBook,
  },
  {
    title: 'Comprehensive Orthopedic Care',
    description:
      'Care that spans consultation and diagnosis through to surgery, rehabilitation and long-term review.',
    icon: TbShieldCheck,
  },
  {
    title: 'Structured Follow-up',
    description:
      'Planned review appointments to monitor healing and progress, and to adjust rehabilitation as recovery continues.',
    icon: TbRefresh,
  },
];

/* ------------------------------------------------------------------ *
 * Surgical expertise
 * ------------------------------------------------------------------ */

export interface ExpertiseArea {
  title: string;
  description: string;
}

export const surgicalExpertise: ExpertiseArea[] = [
  {
    title: 'Joint Replacement (Arthroplasty)',
    description:
      'Knee and hip replacement for advanced joint damage, with planning of implant selection, sizing and alignment for each patient.',
  },
  {
    title: 'Orthopedic Trauma Surgery',
    description:
      'Management of fractures and dislocations, from immobilisation through to surgical realignment and fixation.',
  },
  {
    title: 'Pelvic & Acetabular Surgery',
    description:
      'Surgical care for injuries of the pelvic ring and hip socket, supported by detailed imaging and pre-operative planning.',
  },
  {
    title: 'Arthroscopic Procedures',
    description:
      'Minimally invasive assessment and treatment of joint problems through small incisions using a camera and fine instruments.',
  },
  {
    title: 'Complex Fracture Reconstruction',
    description:
      'Treatment of multi-fragment and joint-surface fractures, including staged approaches where soft tissues require protection.',
  },
  {
    title: 'Post-Operative Rehabilitation Planning',
    description:
      'Structured recovery plans developed with physiotherapy input and reviewed at each follow-up visit.',
  },
];

/* ------------------------------------------------------------------ *
 * Treatment process
 * ------------------------------------------------------------------ */

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
  icon: IconType;
}

export const treatmentProcess: ProcessStep[] = [
  {
    step: '01',
    title: 'Consultation',
    description:
      'A detailed discussion of your symptoms, medical history and how the problem affects your daily life.',
    icon: TbStethoscope,
  },
  {
    step: '02',
    title: 'Diagnosis',
    description:
      'Clinical examination supported by X-rays or further imaging where needed, to identify the underlying cause.',
    icon: TbReportMedical,
  },
  {
    step: '03',
    title: 'Treatment Planning',
    description:
      'The available options — non-surgical and surgical — are explained, along with what each one involves.',
    icon: TbClipboardList,
  },
  {
    step: '04',
    title: 'Procedure / Treatment',
    description:
      'The agreed treatment is carried out, whether that is conservative management or a planned surgical procedure.',
    icon: TbActivityHeartbeat,
  },
  {
    step: '05',
    title: 'Recovery',
    description:
      'Guided rehabilitation focused on restoring movement, strength and confidence at a pace suited to you.',
    icon: TbHeartHandshake,
  },
  {
    step: '06',
    title: 'Follow-up Care',
    description:
      'Scheduled reviews to monitor healing and progress, and to adjust your rehabilitation plan as needed.',
    icon: TbCalendarCheck,
  },
];

/* ------------------------------------------------------------------ *
 * FAQs
 * ------------------------------------------------------------------ */

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: 'When should I consider knee replacement?',
    answer:
      'Knee replacement is generally considered when knee pain or stiffness from joint damage continues to limit walking, stairs or sleep despite non-surgical measures such as medication, physiotherapy and activity modification. Whether it is appropriate for you depends on your examination and imaging findings, and can only be decided after an individual consultation.',
  },
  {
    question: 'What is arthroscopy?',
    answer:
      'Arthroscopy is a minimally invasive procedure in which a fine camera is inserted into a joint through a small incision, giving a magnified view of the structures inside. Fine instruments can be passed through additional small incisions so that certain problems can be assessed and, where suitable, treated during the same procedure.',
  },
  {
    question: 'What happens during an orthopedic consultation?',
    answer:
      'A consultation usually begins with a discussion of your symptoms, medical history and how the problem affects your daily activity. This is followed by a clinical examination of the affected area. X-rays or further imaging may be advised. The findings are then explained to you along with the treatment options available.',
  },
  {
    question: 'How long does recovery usually take?',
    answer:
      'Recovery timelines vary considerably depending on the condition, the treatment carried out and individual factors such as age, general health and rehabilitation progress. A general outline is discussed with you before treatment, and your progress is reviewed at each follow-up visit.',
  },
  {
    question: 'When should a fracture be evaluated by an orthopedic surgeon?',
    answer:
      'Prompt assessment is advisable after any significant injury, particularly where there is visible deformity, severe pain, marked swelling, or an inability to move or bear weight on the limb. In an emergency, please seek immediate medical attention at the nearest hospital.',
  },
  {
    question: 'Can I book an appointment at any of the three clinics?',
    answer:
      "Yes. Appointments can be requested at Dr. Goutami's Children's Clinic & Ortho Care, Regain Bone and Joint Care Centre, or Archana Hospital. Each clinic has its own consultation timings and fee, listed in the Locations section. You can select your preferred clinic in the appointment form.",
  },
  {
    question: 'Do I need to bring previous scans or reports?',
    answer:
      'If you have earlier X-rays, scans, discharge summaries or reports relating to your condition, bringing them to the consultation is helpful. Previous imaging often provides useful context and can assist in assessing how the condition has changed over time.',
  },
  {
    question: 'Is surgery always necessary for joint pain?',
    answer:
      'No. Many orthopedic conditions are managed without surgery, using measures such as medication, physiotherapy, activity modification, bracing or injections. Surgery is considered when non-surgical treatment is no longer providing adequate relief, or when the nature of the problem makes it the more appropriate option.',
  },
];

/* ------------------------------------------------------------------ *
 * Testimonials
 *
 * Carried over verbatim from the live Rocket site, which is the agreed
 * source of truth for existing content. Confirm these are genuine,
 * consented patient reviews before publishing — they are presented to
 * visitors as real feedback.
 * ------------------------------------------------------------------ */

export interface Testimonial {
  id: string;
  quote: string;
  attribution: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'Dr. Kranthi Reddy performed my knee replacement surgery with exceptional skill. I am now walking without pain after years of suffering. Highly recommended.',
    attribution: 'Ramesh K.',
  },
  {
    id: 't2',
    quote:
      'After my hip replacement, I can move freely again. Dr. Reddy and his team were professional, caring, and thorough throughout my treatment.',
    attribution: 'Sunita M.',
  },
  {
    id: 't3',
    quote:
      "I had a complex fracture after an accident. Dr. Kranthi Reddy's expertise in trauma care helped me recover fully. Grateful for his dedication.",
    attribution: 'Venkat R.',
  },
  {
    id: 't4',
    quote:
      'The arthroscopy procedure was minimally invasive and my recovery was quick. Dr. Reddy explained everything clearly and made me feel at ease.',
    attribution: 'Priya S.',
  },
];

/* ------------------------------------------------------------------ *
 * Gallery
 *
 * Placeholder slots only — no stock photography of identifiable people.
 * Drop real clinic images into src/assets/gallery and map them here.
 * ------------------------------------------------------------------ */

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  /** Populate with an imported image to replace the placeholder tile. */
  image?: string;
  imageAlt?: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Consultation Room',
    caption: 'Placeholder — add a photograph of the consultation space.',
  },
  {
    id: 'g2',
    title: 'Clinic Reception',
    caption: 'Placeholder — add a photograph of the reception area.',
  },
  {
    id: 'g3',
    title: 'Examination Area',
    caption: 'Placeholder — add a photograph of the examination area.',
  },
  {
    id: 'g4',
    title: 'Diagnostic Imaging',
    caption: 'Placeholder — add a photograph of the imaging facilities.',
  },
  {
    id: 'g5',
    title: 'Operating Facility',
    caption: 'Placeholder — add a photograph of the theatre facility.',
  },
  {
    id: 'g6',
    title: 'Rehabilitation Space',
    caption: 'Placeholder — add a photograph of the physiotherapy area.',
  },
];
