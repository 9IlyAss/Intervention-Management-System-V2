import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function About() {

  const { user, setUser } = useAuth();
  
  // Determine user role from the model
  const isClient = user?.role === 'client';
  const isTechnician = user?.role === 'technician';

  // Function to handle links to email/phone
  const handleContactPress = (type, value) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
    }
  };
  const handleGoBack = () => {
    if (isTechnician) {
      // Navigate back to technician profile
      router.replace('/(app)/(technician)/(tabs)/profile');
    } else if (isClient) {
      // Navigate back to client profile
      router.replace('/(app)/(client)/(tabs)/profile');
    } else {
      // Fallback to generic back navigation
      router.back();
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholderButton} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Logo */}
        <View style={styles.logoContainer}>
              <Image
  source={require('../../../assets/images/logo.jpg')}
  style={{ width: 200, height: 109 }}
/>          
          <Text style={styles.companyName}>Golden Digital Service</Text>
          <Text style={styles.tagline}>Bringing tomorrow's technology to Morocco today</Text>
        </View>
        
        {/* CEO Message Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CEO MESSAGE</Text>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              Golden Digital Service est une société informatique multi-service des nouvelles technologies répond aux besoins des professionnels et particuliers. GDE s'inscrit pleinement dans le mouvement moderne de commerce et de services local afin de bien satisfait nos clients. Notre pays est dynamique et innovant, nous nous efforçons chaque jour d'être les ambassadeurs de cette modernité en marche, et de représenter au mieux une certaine idée du raffinement, de l'hospitalité ainsi que la créativité et l'exception qui caractérisent notre beau pays, le Maroc.
            </Text>
            <Text style={styles.quoteName}>Otman Oubreik</Text>
            <Text style={styles.quoteTitle}>CEO et Fondateur de Golden Digital Service</Text>
          </View>
        </View>
        
        {/* Our Philosophy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTRE PHILOSOPHIE</Text>
          <Text style={styles.sectionText}>
            GDE innove sans cesse grâce à ses produits, ses marques et ses services tout en accompagnant les avancées du Maroc, dans un monde où tout change, tout bouge, et où tout devient réalisable, en étant à l'affût des évolutions sociétales et en veille permanente sur les attentes du marché.
          </Text>
          <Text style={styles.sectionText}>
            Élargir le champ de vision, permettre une nouvelle approche, créer de nouvelles habitudes, introduire de nouvelles perspectives en matière de commerce et d'expériences de consommation, embellir le quotidien, moderniser le cadre de vie, façonner un nouveau paysage commercial…, pour nos clients, nous imaginons ce qui se fait de mieux.
          </Text>
        </View>
        
        {/* Our Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOS SERVICES</Text>
          <View style={styles.servicesList}>
            {[
              { icon: 'desktop-outline', text: 'Services informatiques et intervention sur site' },
              { icon: 'build-outline', text: 'Contrats maintenance et diagnostic' },
              { icon: 'videocam-outline', text: 'Cameras de surveillance et standar Telephonique' },
              { icon: 'shield-outline', text: 'Produits haut game de surveillance, telephonique, alarme, pointage' },
              { icon: 'print-outline', text: 'Logiciels et imprimants. Imprimante industriels' },
              { icon: 'archive-outline', text: 'Fourniture de bureau' },
              { icon: 'volume-high-outline', text: 'Sonorisation et equipement de salle de reunion' },
              { icon: 'settings-outline', text: 'Service apres vente' }
            ].map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={service.icon} size={24} color="#6200EE" />
                </View>
                <Text style={styles.serviceText}>{service.text}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Our Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOS VALEURS</Text>
          <Text style={styles.valueIntro}>GDE est animé par ses principes fondateurs et une identité forte</Text>
          
          {/* Trust Value */}
          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#6200EE" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>La confiance</Text>
              <Text style={styles.valueText}>
                La confiance est la base de nos relations. En fournissant constamment des produits authentiques, des informations précises et un service exceptionnel, nous visons à établir une confiance durable avec nos clients.
              </Text>
            </View>
          </View>
          
          {/* Quality Value */}
          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <Ionicons name="ribbon-outline" size={28} color="#6200EE" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Qualité</Text>
              <Text style={styles.valueText}>
                Notre équipe croit qu'il est important d'avoir un impact positif sur la vie de nos clients, en garantissant les normes de qualité les plus élevées.
              </Text>
            </View>
          </View>
          
          {/* Integrity Value */}
          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <Ionicons name="bookmark-outline" size={28} color="#6200EE" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Intégrité</Text>
              <Text style={styles.valueText}>
                Nous nous comportons avec honnêteté, éthique et professionnalisme. Nous assumons la responsabilité de nos actions et respectons les normes les plus élevées dans la fourniture de solutions innovantes.
              </Text>
            </View>
          </View>
          
          {/* Innovation Value */}
          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <Ionicons name="bulb-outline" size={28} color="#6200EE" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Innovation</Text>
              <Text style={styles.valueText}>
                Nous considérons l'innovation comme une force motrice dans notre quête pour améliorer de nouvelles solutions. En restant à la pointe des avancées technologiques, des idées et des processus, nous améliorons continuellement nos offres.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACTEZ-NOUS</Text>
          
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={24} color="#6200EE" />
            <Text style={styles.contactText}>Lot Ennajah Imm D N12 Inzegane Cote Merjane</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('phone', '0661909664')}
          >
            <Ionicons name="call-outline" size={24} color="#6200EE" />
            <Text style={styles.contactText}>06 61 90 96 64</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('phone', '0528812415')}
          >
            <Ionicons name="call-outline" size={24} color="#6200EE" />
            <Text style={styles.contactText}>05 28 81 24 15</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('email', 'Othman@gde.ma')}
          >
            <Ionicons name="mail-outline" size={24} color="#6200EE" />
            <Text style={styles.contactText}>Othman@gde.ma</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('email', 'Contact@gde.ma')}
          >
            <Ionicons name="mail-outline" size={24} color="#6200EE" />
            <Text style={styles.contactText}>Contact@gde.ma</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
          >
            <Ionicons name="logo-facebook" size={24} color="#6200EE" />
            <Text style={styles.contactText}>Goldendigitaledition</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>COPYRIGHT GDE 2023. ALL RIGHTS RESERVED</Text>
        </View>
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  quoteContainer: {
    backgroundColor: '#F5F0FF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  quoteText: {
    fontSize: 15,
    color: '#333333',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'justify',
  },
  quoteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  quoteTitle: {
    fontSize: 14,
    color: '#666666',
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
  },
  valueIntro: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  valueItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
  },
  valueIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 15,
    color: '#333333',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#999999',
  },
});