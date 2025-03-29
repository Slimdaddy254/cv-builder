import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Mail, 
  Phone, 
  MapPin, 
  UserCircle2, 
  Building2, 
  GraduationCap, 
  Sun, 
  Moon,
  Award,
  Sparkles,
  ScrollText,
  FileText,
  Download,
  ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface CVData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  skills: string[];
  experience: {
    company: string;
    position: string;
    startDate: Date | null;
    endDate: Date | null;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
}

const placeholderData: CVData = {
  personalInfo: {
    name: 'Sarah Anderson',
    title: 'Senior Software Engineer',
    email: 'sarah.anderson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.',
  },
  skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'System Design', 'Team Leadership'],
  experience: [
    {
      company: 'Tech Innovations Inc.',
      position: 'Senior Software Engineer',
      startDate: new Date('2020-01-01'),
      endDate: null,
      description: 'Led development of cloud-native applications, resulting in 40% improvement in system performance. Mentored junior developers and implemented best practices.',
    },
    {
      company: 'Digital Solutions Ltd.',
      position: 'Software Engineer',
      startDate: new Date('2018-01-01'),
      endDate: new Date('2019-12-31'),
      description: 'Developed and maintained multiple client-facing applications using React and Node.js. Improved CI/CD pipeline efficiency by 30%.',
    }
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'M.S. Computer Science',
      year: '2018',
    },
    {
      school: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      year: '2016',
    }
  ],
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [cvData, setCvData] = useState<CVData>(placeholderData);
  const [newSkill, setNewSkill] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  const downloadPdfDocument = async () => {
    if (!cvRef.current) return;
    
    const canvas = await html2canvas(cvRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('cv.pdf');
  };

  const downloadDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: cvData.personalInfo.name,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: cvData.personalInfo.title,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Email: ", bold: true }),
              new TextRun(cvData.personalInfo.email),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Phone: ", bold: true }),
              new TextRun(cvData.personalInfo.phone),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Location: ", bold: true }),
              new TextRun(cvData.personalInfo.location),
            ],
          }),
          new Paragraph({
            text: "Professional Summary",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: cvData.personalInfo.summary,
          }),
          new Paragraph({
            text: "Skills",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: cvData.skills.join(", "),
          }),
          // Experience
          new Paragraph({
            text: "Experience",
            heading: HeadingLevel.HEADING_2,
          }),
          ...cvData.experience.flatMap(exp => [
            new Paragraph({
              text: exp.position,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: exp.company + " | ", bold: true }),
                new TextRun(
                  `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`
                ),
              ],
            }),
            new Paragraph({
              text: exp.description,
            }),
          ]),
          // Education
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_2,
          }),
          ...cvData.education.flatMap(edu => [
            new Paragraph({
              text: edu.school,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: edu.degree,
            }),
            new Paragraph({
              text: edu.year,
            }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personalInfo: { ...cvData.personalInfo, [field]: value },
    });
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      setCvData({
        ...cvData,
        skills: [...cvData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = cvData.skills.filter((_, i) => i !== index);
    setCvData({
      ...cvData,
      skills: newSkills
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExperience = [...cvData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setCvData({ ...cvData, experience: newExperience });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...cvData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setCvData({ ...cvData, education: newEducation });
  };

  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [...cvData.experience, { company: '', position: '', startDate: null, endDate: null, description: '' }],
    });
  };

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [...cvData.education, { school: '', degree: '', year: '' }],
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Present';
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className={`min-h-screen flex flex-col font-body transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`w-full py-6 px-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-display font-bold">CV Builder</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isExportMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } ring-1 ring-black ring-opacity-5 z-50`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        downloadPdfDocument();
                        setIsExportMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-white hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Download as PDF
                    </button>
                    <button
                      onClick={() => {
                        downloadDocx();
                        setIsExportMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-white hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Download as DOCX
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-800'} shadow-lg`}
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-8">
          <div className={`lg:w-1/2 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            
            <div className={`p-6 rounded-xl shadow-lg transition-all duration-300
              ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}
              ${activeSection === 'personal' ? 'ring-2 ring-gray-500' : ''}`}
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleSectionClick('personal')}
              >
                <h2 className="text-2xl font-display mb-4 flex items-center">
                  <UserCircle2 className="w-6 h-6 mr-2" />
                  Personal Information
                </h2>
              </div>
              {activeSection === 'personal' && (
                <div className="space-y-4 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    value={cvData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Professional Title"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    value={cvData.personalInfo.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    value={cvData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    value={cvData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    value={cvData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  />
                  <textarea
                    placeholder="Professional Summary"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    rows={4}
                    value={cvData.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className={`p-6 rounded-xl shadow-lg transition-all duration-300
              ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}
              ${activeSection === 'skills' ? 'ring-2 ring-gray-500' : ''}`}
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleSectionClick('skills')}
              >
                <h2 className="text-2xl font-display mb-4 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Skills
                </h2>
              </div>
              {activeSection === 'skills' && (
                <div className="space-y-4 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={addSkill}
                  />
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill, index) => (
                      <div key={index} className={`flex items-center px-3 py-1 rounded-full
                        ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(index)}
                          className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`p-6 rounded-xl shadow-lg transition-all duration-300
              ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}
              ${activeSection === 'experience' ? 'ring-2 ring-gray-500' : ''}`}
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleSectionClick('experience')}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-display flex items-center">
                    <Building2 className="w-6 h-6 mr-2" />
                    Experience
                  </h2>
                  {activeSection === 'experience' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addExperience();
                      }}
                      className={`px-4 py-2 rounded-lg transition-all
                        ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                    >
                      Add Experience
                    </button>
                  )}
                </div>
              </div>
              {activeSection === 'experience' && (
                <div className="space-y-6 mt-4 animate-fadeIn">
                  {cvData.experience.map((exp, index) => (
                    <div key={index} className={`space-y-4 p-4 rounded-lg border
                      ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <input
                        type="text"
                        placeholder="Company"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                          ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                          ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      />
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <DatePicker
                            selected={exp.startDate}
                            onChange={(date) => updateExperience(index, 'startDate', date)}
                            placeholderText="Start Date"
                            dateFormat="MMM yyyy"
                            showMonthYearPicker
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                              ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                          />
                        </div>
                        <div className="w-1/2">
                          <DatePicker
                            selected={exp.endDate}
                            onChange={(date) => updateExperience(index, 'endDate', date)}
                            placeholderText="End Date"
                            dateFormat="MMM yyyy"
                            showMonthYearPicker
                            isClearable
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                              ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                          />
                        </div>
                      </div>
                      <textarea
                        placeholder="Description"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                          ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                        rows={3}
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-6 rounded-xl shadow-lg transition-all duration-300
              ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}
              ${activeSection === 'education' ? 'ring-2 ring-gray-500' : ''}`}
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleSectionClick('education')}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-display flex items-center">
                    <GraduationCap className="w-6 h-6 mr-2" />
                    Education
                  </h2>
                  {activeSection === 'education' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addEducation();
                      }}
                      className={`px-4 py-2 rounded-lg transition-all
                        ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                    >
                      Add Education
                    </button>
                  )}
                </div>
              </div>
              {activeSection === 'education' && (
                <div className="space-y-6 mt-4 animate-fadeIn">
                  {cvData.education.map((edu, index) => (
                    <div key={index} className={`space-y-4 p-4 rounded-lg border
                      ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <input
                        type="text"
                        placeholder="School"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                          ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                        value={edu.school}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                          ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Year"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-gray-500 transition-all
                          ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 p-4 lg:p-8">
            <div 
              ref={cvRef}
              className={`max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl 
              ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
              transform transition-all duration-300
              bg-paper bg-cover bg-center
              relative`}>
              <div className="p-8 relative backdrop-blur-sm backdrop-brightness-150">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-display font-bold mb-2">
                    {cvData.personalInfo.name}
                  </h1>
                  <p className="text-xl mb-4 opacity-90">{cvData.personalInfo.title}</p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm opacity-75">
                    {cvData.personalInfo.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{cvData.personalInfo.email}</span>
                      </div>
                    )}
                    {cvData.personalInfo.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{cvData.personalInfo.phone}</span>
                      </div>
                    )}
                    {cvData.personalInfo.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{cvData.personalInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <ScrollText className="w-5  h-5 mr-2" />
                    <h2 className="text-xl font-display font-bold">Professional Summary</h2>
                  </div>
                  <p className="opacity-90 leading-relaxed">{cvData.personalInfo.summary}</p>
                </div>

                <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center mb-4">
                    <Award className="w-5 h-5 mr-2" />
                    <h2 className="text-xl font-display font-bold">Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm
                        ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center mb-4">
                    <Building2 className="w-5 h-5 mr-2" />
                    <h2 className="text-xl font-display font-bold">Experience</h2>
                  </div>
                  {cvData.experience.map((exp, index) => (
                    <div key={index} className="mb-6">
                      <h3 className="font-bold text-lg">{exp.position}</h3>
                      <div className="text-sm opacity-75 mb-2">
                        {exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </div>
                      <p className="opacity-90">{exp.description}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    <h2 className="text-xl font-display font-bold">Education</h2>
                  </div>
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="font-bold text-lg">{edu.school}</h3>
                      <div className="opacity-90">{edu.degree}</div>
                      <div className="text-sm opacity-75">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`w-full py-4 px-8 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} shadow-inner mt-8`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            © 2025 @shadyCreations. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;