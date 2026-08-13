import type { IconType } from 'react-icons';
import { GiKneeCap, GiLeg, GiPelvisBone, GiBrokenBone } from 'react-icons/gi';
import { TbMicroscope, TbBandage } from 'react-icons/tb';

import kneeImage from '@/assets/services/knee-replacement.svg';
import hipImage from '@/assets/services/hip-replacement.svg';
import arthroscopyImage from '@/assets/services/arthroscopy.svg';
import traumaImage from '@/assets/services/trauma-care.svg';
import pelvicImage from '@/assets/services/pelvic-surgery.svg';
import complexTraumaImage from '@/assets/services/complex-trauma-surgery.svg';

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  title: string;
  /** Short card description — kept to the wording supplied in the brief. */
  description: string;
  image: string;
  imageAlt: string;
  /**
   * Alt text used once a real clinical photograph is dropped into
   * `src/assets/services/photos/<slug>.jpg`. It describes the supplied
   * photograph rather than the fallback illustration.
   */
  photoAlt: string;
  icon: IconType;
  intro: string;
  whatItIs: string[];
  whenConsidered: string[];
  approach: string[];
  recovery: string[];
  faqs: ServiceFaq[];
}

/**
 * Real clinical photographs, when supplied, override the fallback illustrations.
 *
 * Drop a file into `src/assets/services/photos/` named after the service slug
 * (e.g. `knee-replacement.jpg`) and it is picked up automatically — no code
 * change needed. The illustration is used until a photo exists, so the build
 * never breaks on a missing file.
 */
const servicePhotos = import.meta.glob('../assets/services/photos/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

const photoForSlug = (slug: string): string | undefined => {
  const match = Object.entries(servicePhotos).find(([path]) => {
    const fileName = (path.split('/').pop() ?? '').toLowerCase();
    const dot = fileName.lastIndexOf('.');
    if (dot < 0) return false;

    return (
      fileName.slice(0, dot) === slug && IMAGE_EXTENSIONS.includes(fileName.slice(dot + 1))
    );
  });

  return match?.[1];
};

/**
 * EXACTLY six services, in the order they appear in the 3 × 2 desktop grid.
 * Row 1: Knee Replacement, Hip Replacement, Arthroscopy
 * Row 2: Trauma Care, Pelvic Surgery, Complex Trauma Surgery
 */
const baseServices: Service[] = [
  {
    slug: 'knee-replacement',
    title: 'Knee Replacement',
    description:
      'Advanced knee replacement surgery to relieve pain and restore mobility in damaged knee joints.',
    image: kneeImage,
    imageAlt: 'Illustration of a knee joint with a joint-replacement implant surface',
    photoAlt: "Surgeon examining a patient's knee after joint replacement surgery",
    icon: GiKneeCap,
    intro:
      'Knee replacement is considered for people whose knee joint has been significantly damaged by arthritis or injury, and whose pain or stiffness has not settled adequately with non-surgical care. The aim of surgery is to relieve pain and restore comfortable movement so that everyday activities become more manageable.',
    whatItIs: [
      'Knee replacement, also called knee arthroplasty, is a procedure in which damaged joint surfaces of the knee are replaced with implant components designed to move smoothly against one another.',
      'Depending on how much of the joint is affected, the procedure may involve the whole joint (total knee replacement) or only the damaged compartment (partial knee replacement). The right option is decided after clinical examination and imaging.',
      'The goal is to reduce pain arising from the worn joint surfaces and to restore a more natural range of movement. Outcomes vary between individuals and depend on factors such as the degree of damage, general health and rehabilitation.',
    ],
    whenConsidered: [
      'Persistent knee pain that limits walking, stairs, or sleep',
      'Advanced joint degeneration or arthritis confirmed on imaging',
      'Stiffness or deformity that affects standing and daily activity',
      'Limited or reducing benefit from medication, physiotherapy and activity modification',
      'Knee damage following an earlier injury or fracture',
    ],
    approach: [
      'A detailed consultation covering symptoms, medical history and current mobility',
      'Clinical examination along with X-rays or other imaging as required',
      'Discussion of non-surgical options, and whether surgery is appropriate at this stage',
      'Pre-operative assessment and planning of implant type and alignment',
      'The procedure carried out under anaesthesia chosen with the anaesthetist',
      'Guided early mobilisation, usually beginning soon after surgery',
    ],
    recovery: [
      'Walking with support typically begins in the early post-operative period, guided by the surgical and physiotherapy team.',
      'A structured physiotherapy programme focuses on regaining movement, strength and confidence in the joint.',
      'Return to routine activity is gradual and varies from person to person, depending on general health, the extent of surgery and rehabilitation progress.',
      'Scheduled follow-up visits are used to review healing, movement and implant position, and to adjust rehabilitation as needed.',
    ],
    faqs: [
      {
        question: 'How do I know whether knee replacement is right for me?',
        answer:
          'That decision follows a consultation, clinical examination and imaging. Non-surgical measures are usually explored first, and surgery is discussed when symptoms continue to limit daily life. An individual assessment is needed before any recommendation can be made.',
      },
      {
        question: 'Is the whole knee always replaced?',
        answer:
          'No. If damage is limited to one compartment of the knee, a partial replacement may be suitable. If the joint is more widely affected, a total knee replacement may be advised. The plan is based on your imaging and examination findings.',
      },
      {
        question: 'How long does recovery take?',
        answer:
          'Recovery is gradual and differs between individuals. Early mobilisation usually starts soon after surgery, with rehabilitation continuing over the following weeks and months. Your recovery plan and expected milestones are discussed with you directly.',
      },
    ],
  },
  {
    slug: 'hip-replacement',
    title: 'Hip Replacement',
    description:
      'Total and partial hip replacement procedures to restore pain-free movement and quality of life.',
    image: hipImage,
    imageAlt: 'Illustration of a hip joint with a ball-and-socket replacement implant',
    photoAlt: "Doctor examining a patient's hip area during an orthopedic assessment",
    icon: GiLeg,
    intro:
      'Hip replacement is considered when the hip joint has been substantially damaged by arthritis, injury or conditions affecting the blood supply to the bone, and pain or stiffness continues to limit walking and daily activity despite non-surgical care.',
    whatItIs: [
      'Hip replacement, or hip arthroplasty, replaces the damaged ball-and-socket surfaces of the hip with implant components that allow smoother, less painful movement.',
      'The femoral head is replaced with an implant head and stem, and the socket is resurfaced with a cup component. Implant choice is planned according to bone quality, anatomy and activity level.',
      'The intention is to relieve pain arising from the damaged joint and to improve the ability to walk, sit and move comfortably. Results vary between individuals.',
    ],
    whenConsidered: [
      'Groin or hip pain that persists during walking, sitting or at rest',
      'Advanced hip arthritis or joint degeneration seen on imaging',
      'Stiffness that limits bending, sitting or putting on footwear',
      'Reduced response to medication, physiotherapy and activity modification',
      'Hip damage following fracture or conditions affecting the femoral head',
    ],
    approach: [
      'Consultation covering symptoms, walking distance, and effect on daily routine',
      'Examination of hip movement, gait and limb length, with X-rays or further imaging',
      'Review of non-surgical options and whether surgery is appropriate',
      'Pre-operative planning of implant size, fixation and positioning',
      'Surgery performed under anaesthesia planned with the anaesthetist',
      'Early supported mobilisation with physiotherapy guidance',
    ],
    recovery: [
      'Standing and walking with support usually begins early after surgery, under supervision.',
      'Physiotherapy focuses on safe movement, walking pattern and progressive strengthening.',
      'Specific movement precautions may be advised for a period after surgery, and these are explained clearly before discharge.',
      'Follow-up appointments review wound healing, mobility and implant position over time.',
    ],
    faqs: [
      {
        question: 'What causes hip damage that may need replacement?',
        answer:
          'Common reasons include osteoarthritis, inflammatory arthritis, previous fracture, and conditions affecting blood supply to the femoral head. The underlying cause is identified through examination and imaging during consultation.',
      },
      {
        question: 'Will I need to change how I move after surgery?',
        answer:
          'Some movement precautions may be advised for a period after surgery to protect the joint while healing takes place. These are individual and will be explained to you as part of your rehabilitation plan.',
      },
      {
        question: 'When can I walk after hip replacement?',
        answer:
          'Supported walking commonly begins in the early post-operative period, guided by the treating team. Progression is gradual and depends on your general health, the surgery performed and rehabilitation.',
      },
    ],
  },
  {
    slug: 'arthroscopy',
    title: 'Arthroscopy',
    description:
      'Minimally invasive arthroscopic procedures for accurate diagnosis and treatment of joint conditions.',
    image: arthroscopyImage,
    imageAlt:
      'Illustration of a minimally invasive arthroscopy procedure with a camera scope viewing inside a joint',
    photoAlt:
      'Arthroscopic surgery in progress with specialised surgical instruments',
    icon: TbMicroscope,
    intro:
      'Arthroscopy allows the inside of a joint to be examined and treated through small incisions using a fine camera and specialised instruments. It is used both to clarify a diagnosis and, where suitable, to address the problem during the same procedure.',
    whatItIs: [
      'A small camera called an arthroscope is inserted through a keyhole incision, projecting a magnified view of the inside of the joint onto a monitor.',
      'Fine instruments are introduced through additional small incisions, allowing structures such as cartilage, ligaments and the joint lining to be assessed and treated where appropriate.',
      'Because the incisions are small, arthroscopy is generally associated with less soft-tissue disruption than open surgery. Suitability depends on the joint involved and the specific problem.',
    ],
    whenConsidered: [
      'Joint pain, catching or locking that has not been explained by examination and imaging alone',
      'Suspected cartilage, meniscal or ligament injury',
      'Persistent joint swelling or stiffness requiring further assessment',
      'Certain sports-related orthopedic injuries affecting the joint',
      'Selected conditions of the joint lining where a targeted procedure may help',
    ],
    approach: [
      'Consultation and examination of the affected joint',
      'Imaging such as X-ray or MRI to help clarify the diagnosis',
      'Discussion of whether arthroscopy is likely to add diagnostic or treatment value',
      'The procedure performed through small incisions under suitable anaesthesia',
      'Assessment of the joint, with treatment carried out in the same sitting where appropriate',
      'A rehabilitation plan tailored to the joint and the findings',
    ],
    recovery: [
      'Many arthroscopic procedures are performed as day-care or short-stay surgery, depending on the joint and the treatment carried out.',
      'Swelling and discomfort around the small incisions are usual in the early period and are managed with the advice given at discharge.',
      'Physiotherapy is tailored to what was found and treated inside the joint, and typically progresses through movement, then strengthening.',
      'Return to activity or sport is staged, and timelines are discussed individually at follow-up.',
    ],
    faqs: [
      {
        question: 'Is arthroscopy major surgery?',
        answer:
          'Arthroscopy is performed through small incisions rather than a large opening, so it is described as minimally invasive. It is still a surgical procedure carried out under anaesthesia, and it carries its own considerations that are discussed with you beforehand.',
      },
      {
        question: 'Can the problem be treated during the same procedure?',
        answer:
          'Often, yes. The joint is assessed first, and where a treatable problem is confirmed and it is appropriate to proceed, it may be addressed in the same sitting. This is planned and consented in advance.',
      },
      {
        question: 'Will I need physiotherapy afterwards?',
        answer:
          'Usually some form of guided rehabilitation is advised. The programme depends on the joint involved and what was treated, and it is explained to you as part of your discharge and follow-up plan.',
      },
    ],
  },
  {
    slug: 'trauma-care',
    title: 'Trauma Care',
    description:
      'Comprehensive management of fractures, dislocations, and complex musculoskeletal injuries.',
    image: traumaImage,
    imageAlt:
      'Illustration of orthopedic trauma care showing a fractured bone supported by a protective cast',
    photoAlt: "Doctor providing compassionate care to a patient at the bedside",
    icon: GiBrokenBone,
    intro:
      'Orthopedic trauma care covers the assessment and treatment of injuries to bones, joints and surrounding soft tissues — from straightforward fractures to dislocations and injuries sustained in road traffic or workplace accidents.',
    whatItIs: [
      'Trauma care begins with careful assessment of the injury, the surrounding soft tissues, and the circulation and nerve supply to the limb.',
      'Treatment may be non-surgical — such as immobilisation in a cast or splint — or surgical, where the bone needs to be realigned and held in position while it heals.',
      'The approach depends on the bone involved, the pattern of the fracture, the condition of the soft tissues, and the individual patient.',
    ],
    whenConsidered: [
      'A suspected fracture following a fall, road traffic accident or sports injury',
      'Joint dislocation or a joint that will not move normally after injury',
      'Visible deformity, marked swelling, or inability to bear weight',
      'Pain following injury that does not settle as expected',
      'A previously treated fracture that is not healing as anticipated',
    ],
    approach: [
      'Prompt clinical assessment of the injury and the affected limb',
      'X-rays, and where needed CT or other imaging, to define the injury pattern',
      'Stabilisation and pain management as an immediate priority',
      'A decision between non-surgical immobilisation and surgical fixation',
      'Where surgery is indicated, realignment and fixation of the bone',
      'A rehabilitation plan started at the appropriate stage of healing',
    ],
    recovery: [
      'Healing timelines vary with the bone injured, the fracture pattern, the treatment used and individual factors such as age and general health.',
      'Repeat X-rays at follow-up are used to confirm alignment and monitor healing.',
      'Weight-bearing and movement are advanced in stages, according to specific instructions given at each review.',
      'Physiotherapy helps restore movement, strength and function once healing allows.',
    ],
    faqs: [
      {
        question: 'When should a fracture be evaluated by an orthopedic surgeon?',
        answer:
          'Prompt assessment is advisable after any significant injury — particularly with visible deformity, severe pain, marked swelling, or an inability to move or bear weight on the limb. In an emergency, seek immediate medical attention at the nearest facility.',
      },
      {
        question: 'Do all fractures need surgery?',
        answer:
          'No. Many fractures are treated without surgery using a cast, splint or brace. Surgery is considered when the bone cannot be held in an acceptable position by other means, or when the injury pattern makes it the better option. This is decided after imaging and examination.',
      },
      {
        question: 'How long does a fracture take to heal?',
        answer:
          'It varies considerably depending on the bone involved, the type of fracture and individual factors. Your expected timeline and follow-up schedule are explained during consultation and reviewed at each visit.',
      },
    ],
  },
  {
    slug: 'pelvic-surgery',
    title: 'Pelvic Surgery',
    description:
      'Specialised surgical treatment for pelvic fractures and acetabular injuries requiring expert care.',
    image: pelvicImage,
    imageAlt:
      'Illustration of the pelvic ring and acetabulum indicating specialised pelvic and acetabular surgical care',
    photoAlt: 'Surgical team operating using minimally invasive instruments',
    icon: GiPelvisBone,
    intro:
      'Pelvic and acetabular injuries are among the more demanding areas of orthopedic trauma. They often follow high-energy accidents and require careful assessment, detailed imaging and considered surgical planning.',
    whatItIs: [
      'The pelvis forms a ring of bone that transfers load between the spine and the legs, and the acetabulum is the socket of the hip joint within it.',
      'Injuries in this region can disrupt the stability of the pelvic ring or involve the hip joint surface, and may be associated with injuries to nearby structures.',
      'Treatment aims to restore the alignment and stability of the pelvis and, where the hip joint is involved, to reconstruct the joint surface as accurately as the injury allows.',
    ],
    whenConsidered: [
      'Pelvic ring injuries following a high-energy accident',
      'Acetabular (hip socket) fractures involving the joint surface',
      'Instability of the pelvis identified on examination and imaging',
      'Displaced fractures where alignment is unlikely to be maintained without surgery',
      'Selected conditions affecting the pelvis or hip socket requiring surgical care',
    ],
    approach: [
      'Detailed assessment including the overall condition of the injured patient',
      'CT and X-ray imaging to define the fracture pattern in three dimensions',
      'Careful pre-operative planning of the surgical approach and fixation',
      'Timing of surgery according to the patient’s condition and soft-tissue state',
      'Reduction of the fracture and fixation with plates and screws where indicated',
      'Coordinated post-operative care and staged rehabilitation',
    ],
    recovery: [
      'Recovery after pelvic and acetabular surgery is typically staged, with protected weight-bearing for a defined period.',
      'Specific instructions on how much weight the limb may take are given, and are reviewed at each follow-up.',
      'Imaging at follow-up is used to confirm that alignment and fixation are maintained as healing progresses.',
      'Rehabilitation focuses on movement, then strength, then walking, advancing as healing permits. Timelines are individual.',
    ],
    faqs: [
      {
        question: 'Why are pelvic injuries treated differently from other fractures?',
        answer:
          'The pelvis is a ring structure with important nearby anatomy, and injuries here can affect stability and the hip joint surface. This means assessment, planning and surgical technique need to be tailored specifically to the injury pattern.',
      },
      {
        question: 'What imaging is usually needed?',
        answer:
          'X-rays are the starting point, and CT is commonly used because it shows the fracture pattern in three dimensions. This helps plan the surgical approach accurately.',
      },
      {
        question: 'How long before I can bear weight?',
        answer:
          'Protected weight-bearing is usual for a period after surgery, and the duration depends on the injury and the fixation performed. You will be given specific instructions and these are reviewed at each follow-up visit.',
      },
    ],
  },
  {
    slug: 'complex-trauma-surgery',
    title: 'Complex Trauma Surgery',
    description:
      'Advanced surgical management of severe multi-system musculoskeletal injuries and complex reconstructions.',
    image: complexTraumaImage,
    imageAlt:
      'Illustration of complex fracture fixation with a surgical plate and screws stabilising a segmented bone',
    photoAlt: "Clinician supporting a patient's ankle during a rehabilitation session",
    icon: TbBandage,
    intro:
      'Some injuries involve several bone fragments, multiple sites, injury to the joint surface, or damage to surrounding soft tissue. These situations call for detailed planning, specialised fixation techniques and a staged approach to treatment.',
    whatItIs: [
      'Complex trauma surgery addresses fractures that are comminuted (broken into several fragments), involve a joint surface, occur at multiple sites, or are complicated by soft-tissue injury.',
      'It also includes the management of injuries that have not healed as expected, or that have healed in a position affecting function.',
      'Treatment may be carried out in planned stages — first stabilising the injury and protecting the soft tissues, and later performing definitive reconstruction when conditions allow.',
    ],
    whenConsidered: [
      'Fractures broken into multiple fragments',
      'Fractures extending into a joint surface',
      'Injuries at more than one site following a major accident',
      'Fractures with associated soft-tissue injury requiring staged treatment',
      'Fractures that have not united, or have healed in a poor position',
      'Injuries requiring revision of previous fracture surgery',
    ],
    approach: [
      'Thorough assessment of the injury and the patient as a whole',
      'Detailed imaging, commonly including CT, to plan reconstruction',
      'Where required, initial stabilisation to protect bone and soft tissue',
      'Definitive fixation planned for when the soft tissues are ready',
      'Reconstruction using techniques appropriate to the fracture pattern',
      'Structured, closely monitored rehabilitation over an extended period',
    ],
    recovery: [
      'Recovery after complex trauma is generally longer and more staged than after a simple fracture, and is planned individually.',
      'Regular review with imaging is used to monitor bone healing and the position of fixation.',
      'Weight-bearing and movement are progressed according to specific instructions at each stage.',
      'Rehabilitation is adjusted over time, and additional procedures are occasionally required as part of the overall plan.',
    ],
    faqs: [
      {
        question: 'What makes a fracture "complex"?',
        answer:
          'Factors include the number of bone fragments, whether the fracture involves a joint surface, injury at more than one site, and the condition of the surrounding soft tissues. Any of these can make treatment more demanding and require specialised planning.',
      },
      {
        question: 'Why is surgery sometimes done in stages?',
        answer:
          'When soft tissues are swollen or injured, operating immediately may not be advisable. An initial procedure can stabilise the injury while the soft tissues settle, with definitive reconstruction carried out once conditions are more favourable.',
      },
      {
        question: 'What follow-up is involved?',
        answer:
          'Follow-up is usually more frequent and continues for longer, with imaging used to confirm that healing and fixation are progressing as expected. Your review schedule is set out for you as part of the treatment plan.',
      },
    ],
  },
];

/** Swaps in a supplied photograph (and its alt text) wherever one is present. */
export const services: Service[] = baseServices.map((service) => {
  const photo = photoForSlug(service.slug);

  return photo ? { ...service, image: photo, imageAlt: service.photoAlt } : service;
});

export const getServiceBySlug = (slug: string | undefined): Service | undefined =>
  services.find((service) => service.slug === slug);

/** Compact list used by the header's SERVICES dropdown. */
export const serviceLinks = services.map(({ slug, title }) => ({
  slug,
  title,
  href: `/services/${slug}`,
}));
