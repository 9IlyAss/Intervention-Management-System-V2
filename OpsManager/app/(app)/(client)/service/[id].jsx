// app/(app)/(client)/service/[id].jsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function ServiceFaqScreen() {
  const { id } = useLocalSearchParams();
  
  // Hardcoded service data with FAQs
  const servicesData = {
    '1': { 
      name: 'IT Services', 
      icon: 'desktop-outline', 
      color: '#2196F3',
      description: "Professional IT support and on-site interventions. We provide maintenance contracts, diagnostics, and comprehensive IT solutions for businesses of all sizes.",
      faqs: [
        { q: 'What IT services do you provide?', a: 'We offer on-site IT support, network setup and maintenance, hardware troubleshooting, software installation, data backup solutions, and cybersecurity services.' },
        { q: 'How quickly can you respond to IT issues?', a: 'We typically respond within 4 hours for standard issues and within 1 hour for critical issues affecting business operations.' },
        { q: 'Do you offer maintenance contracts?', a: 'Yes, we offer monthly and annual maintenance contracts with different service levels to match your business needs and budget.' },
        { q: 'Can you help with remote work setup?', a: 'Absolutely! We provide secure remote access solutions, VPN setup, cloud services configuration, and remote collaboration tools.' }
      ],
      contactPhone: '+123456789',
      contactEmail: 'it@goldendigital.com'
    },
    '2': { 
      name: 'Surveillance', 
      icon: 'videocam-outline', 
      color: '#9C27B0',
      description: "High-quality surveillance camera systems for businesses and homes. We offer complete solutions from installation to monitoring.",
      faqs: [
        { q: 'What surveillance systems do you offer?', a: 'We provide high-quality camera systems including CCTV, IP cameras, wireless systems, and advanced analytics-enabled surveillance.' },
        { q: 'Do you handle installation?', a: 'Yes, our certified technicians handle professional installation and setup of all surveillance equipment, ensuring optimal coverage and performance.' },
        { q: 'Can I access my cameras remotely?', a: 'Yes, we offer systems with secure remote viewing capabilities via smartphone, tablet, or computer.' },
        { q: 'How long is footage stored?', a: 'Storage duration depends on your system configuration. We offer solutions ranging from 7 days to several months of storage, with cloud backup options available.' }
      ],
      contactPhone: '+123456789',
      contactEmail: 'surveillance@goldendigital.com'
    },
    '3': { 
      name: 'Telephony', 
      icon: 'call-outline', 
      color: '#4CAF50',
      description: "Complete telephone systems and PBX solutions for businesses. Modernize your communications with VoIP and digital telephony.",
      faqs: [
        { q: 'What telephone systems do you offer?', a: 'We provide VoIP systems, PBX solutions, digital phone systems, and integrated communications platforms for businesses.' },
        { q: 'Can we keep our existing phone numbers?', a: 'Yes, we can port your existing numbers to the new system in most cases.' },
        { q: 'Do you provide training for new systems?', a: 'Yes, we offer comprehensive training for all users to ensure smooth adoption of new telephony systems.' },
        { q: 'What are the advantages of VoIP over traditional phones?', a: 'VoIP offers cost savings, flexibility, scalability, advanced features like call routing and voicemail-to-email, and integration with other business systems.' }
      ],
      contactPhone: '+123456789',
      contactEmail: 'telephony@goldendigital.com'
    },
    '4': { 
      name: 'Printers', 
      icon: 'print-outline', 
      color: '#FF9800',
      description: "Industrial and office printers, sales and service. We provide maintenance, supplies, and support for all printer types.",
      faqs: [
        { q: 'What types of printers do you supply?', a: 'We offer a wide range of printers including industrial printers, office multifunction devices, label printers, and specialized printing solutions.' },
        { q: 'Do you offer printer maintenance services?', a: 'Yes, we provide regular maintenance, repairs, and emergency support for all types of printers.' },
        { q: 'Can you help reduce printing costs?', a: 'Absolutely. We can analyze your printing needs and recommend solutions to optimize efficiency and reduce costs.' },
        { q: 'Do you supply genuine consumables?', a: 'Yes, we provide genuine OEM consumables as well as high-quality compatible alternatives depending on your preference.' }
      ],
      contactPhone: '+123456789',
      contactEmail: 'printers@goldendigital.com'
    },
    '5': { 
      name: 'Software', 
      icon: 'code-outline', 
      color: '#F44336',
      description: "Business software solutions and support. We provide installation, configuration, and training for various software applications.",
      faqs: [
        { q: 'What software services do you provide?', a: 'We offer software installation, configuration, troubleshooting, updates, and user training for business applications.' },
        { q: 'Do you develop custom software?', a: 'Yes, we can develop custom solutions or customize existing software to meet your specific business needs.' },
        { q: 'What business applications do you support?', a: 'We support a wide range of business applications including ERP systems, CRM software, accounting packages, and productivity suites.' },
        { q: 'Can you help migrate data between systems?', a: 'Yes, we provide data migration services to ensure smooth transitions between different software systems.' }
      ],
      contactPhone: '+123456789',
      contactEmail: 'software@goldendigital.com'
    },
    '6': { 
      name: 'Office Supplies', 
      icon: 'briefcase-outline', 
      color: '#00BCD4',
      description: "Complete range of office supplies and equipment. Regular delivery services available for businesses.",
      faqs: [
        { q: 'What office supplies do you offer?', a: 'We provide a comprehensive range of office supplies including stationery, paper products, filing systems, office furniture, and electronics.' },
        { q: 'Do you offer bulk discounts?', a: 'Yes, we offer volume discounts for bulk orders as well as special pricing for regular customers.' },
        { q: 'How quickly can you deliver office supplies?', a: 'We offer same-day or next-day delivery for most items, depending on stock availability and your location.' },
        { q: 'Can you set up recurring orders?', a: 'Yes, we can establish scheduled deliveries for frequently used items to ensure you never run out of essential supplies.' }
      ],
      contactPhone: '+123456789',
      contactEmail: 'supplies@goldendigital.com'
    },
    '7': { 
  name: 'Maintenance', 
  icon: 'construct', 
  color: '#607D8B',
  description: "Comprehensive maintenance services for your facilities and equipment.",
  faqs: [
    { q: 'What maintenance services do you provide?', a: 'We offer preventive maintenance, repair services, and regular check-ups for various equipment and facilities.' },
    { q: 'How often should maintenance be performed?', a: 'It depends on the equipment. We can help establish an appropriate maintenance schedule based on manufacturer recommendations and usage patterns.' },
    { q: 'Do you offer maintenance contracts?', a: 'Yes, we provide flexible maintenance contracts tailored to your specific needs and budget.' },
    { q: 'Can you handle emergency repairs?', a: 'Absolutely. We offer 24/7 emergency repair services for critical equipment and systems.' }
  ],
  contactPhone: '+123456789',
  contactEmail: 'maintenance@goldendigital.com'
},
'8': { 
  name: 'Alarms', 
  icon: 'notifications', 
  color: '#E91E63',
  description: "Advanced alarm systems for security and safety compliance.",
  faqs: [
    { q: 'What types of alarm systems do you offer?', a: 'We provide intrusion alarms, fire alarm systems, carbon monoxide detectors, and integrated security systems.' },
    { q: 'Do your alarm systems have monitoring services?', a: 'Yes, we offer 24/7 monitoring services that can alert both you and emergency services when alarms are triggered.' },
    { q: 'Can alarms be integrated with other security systems?', a: 'Absolutely. Our alarm systems can be integrated with surveillance cameras, access control, and other security measures.' },
    { q: 'How are false alarms prevented?', a: 'Our systems use advanced technology to minimize false alarms, including dual verification methods and intelligent sensors.' }
  ],
  contactPhone: '+123456789',
  contactEmail: 'alarms@goldendigital.com'
},
'9': { 
  name: 'Sound Systems', 
  icon: 'volume-high', 
  color: '#795548',
  description: "Professional audio systems for offices, conference rooms, and events.",
  faqs: [
    { q: 'What sound system solutions do you offer?', a: 'We provide conference room audio setups, office-wide announcement systems, background music systems, and professional event sound equipment.' },
    { q: 'Can sound systems be integrated with video conferencing?', a: 'Yes, we can integrate audio systems with your video conferencing setup for optimal communication quality.' },
    { q: 'Do you handle installation and setup?', a: 'Absolutely. Our technicians will handle the complete installation, setup, and testing of all sound system components.' },
    { q: 'What about acoustical considerations?', a: 'We assess room acoustics and recommend appropriate solutions to ensure optimal sound quality for your specific environment.' }
  ],
  contactPhone: '+123456789',
  contactEmail: 'audio@goldendigital.com'
}
  };
  
  // Get the service info or use a default if not found
  const serviceInfo = servicesData[id] || { 
    name: 'Service', 
    icon: 'help-circle-outline', 
    color: '#999',
    description: "Please contact us for information about our services.",
    faqs: [
      { q: 'What services do you offer?', a: 'Please contact us for detailed information about our services.' }
    ],
    contactPhone: '+123456789',
    contactEmail: 'info@goldendigital.com'
  };

  const callService = () => {
    Linking.openURL(`tel:${serviceInfo.contactPhone}`);
  };

  const emailService = () => {
    Linking.openURL(`mailto:${serviceInfo.contactEmail}?subject=Inquiry about ${serviceInfo.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{serviceInfo.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconContainer, { backgroundColor: `${serviceInfo.color}15` }]}>
          <Ionicons name={serviceInfo.icon} size={64} color={serviceInfo.color} />
        </View>
        
        <Text style={styles.description}>{serviceInfo.description}</Text>
        
        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {serviceInfo.faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.q}</Text>
              <Text style={styles.answer}>{faq.a}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: serviceInfo.color }]}
              onPress={callService}
            >
              <Ionicons name="call" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.contactButtonText}>Call Us</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: serviceInfo.color }]}
              onPress={emailService}
            >
              <Ionicons name="mail" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.contactButtonText}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.requestButton, { backgroundColor: serviceInfo.color }]}
          onPress={() => router.push({
            pathname: '/(app)/(client)/create',
            params: { categoryId: id, categoryName: serviceInfo.name }
          })}
        >
          <Text style={styles.requestButtonText}>Request This Service</Text>
        </TouchableOpacity>
        
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 24,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  answer: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 50,
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requestButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  spacer: {
    height: 40,
  }
});