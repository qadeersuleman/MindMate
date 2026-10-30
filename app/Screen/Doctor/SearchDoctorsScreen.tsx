import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  SafeAreaView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../assets/colors";
import { getFontStyle } from "../../assets/config/fonts";

const { width } = Dimensions.get("window");

const SearchDoctorsScreen = ({ navigation }) => {
  const [therapists, setTherapists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  // Mental Health Specializations
  const specializations = [
    { key: "all", label: "All" },
    { key: "anxiety", label: "Anxiety" },
    { key: "depression", label: "Depression" },
    { key: "trauma", label: "Trauma" },
    { key: "relationships", label: "Relationships" },
    { key: "stress", label: "Stress" },
    { key: "cbt", label: "CBT" },
  ];

  // Mental Health Professionals Data
  const loadTherapists = async (specialization = "") => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mentalHealthProfessionals = [
        {
          id: "1",
          name: "Dr. Sarah Mitchell",
          specialization: "Anxiety Specialist",
          experience: 8,
          rate: 120,
          rating: 4.9,
          reviews: 184,
          availability: "Today",
          approach: "CBT & Mindfulness",
          avatarColor: Colors.features.mindfulness,
          image: "https://i.pravatar.cc/150?img=47",
        },
        {
          id: "2",
          name: "Dr. Michael Chen",
          specialization: "Trauma Therapist",
          experience: 6,
          rate: 140,
          rating: 4.8,
          reviews: 156,
          availability: "Tomorrow",
          approach: "EMDR Therapy",
          avatarColor: Colors.features.meditation,
          image: "https://i.pravatar.cc/150?img=12",
        },
        {
          id: "3",
          name: "Dr. Emily Rodriguez",
          specialization: "Relationship Counselor",
          experience: 10,
          rate: 130,
          rating: 4.7,
          reviews: 203,
          availability: "Today",
          approach: "Couples Therapy",
          avatarColor: Colors.features.journal,
          image: "https://i.pravatar.cc/150?img=32",
        },
        {
          id: "4",
          name: "Dr. James Wilson",
          specialization: "Depression Expert",
          experience: 12,
          rate: 150,
          rating: 4.9,
          reviews: 267,
          availability: "Tomorrow",
          approach: "Psychodynamic",
          avatarColor: Colors.features.community,
          image: "https://i.pravatar.cc/150?img=15",
        },
        {
          id: "5",
          name: "Dr. Lisa Park",
          specialization: "Stress Management",
          experience: 7,
          rate: 110,
          rating: 4.6,
          reviews: 98,
          availability: "Today",
          approach: "Mindfulness & ACT",
          avatarColor: Colors.features.ai,
          image: "https://i.pravatar.cc/150?img=23",
        },
      ];

      // Filter by specialization if provided
      let filteredTherapists = mentalHealthProfessionals;
      if (specialization && specialization !== "all") {
        filteredTherapists = mentalHealthProfessionals.filter(
          (therapist) =>
            therapist.specialization
              .toLowerCase()
              .includes(specialization.toLowerCase()) ||
            therapist.approach
              .toLowerCase()
              .includes(specialization.toLowerCase())
        );
      }

      setTherapists(filteredTherapists);

      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error loading therapists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTherapists(
      selectedSpecialization === "all" ? "" : selectedSpecialization
    );
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text.length === 0 || text.length > 2) {
      loadTherapists(text);
    }
  };

  const handleSpecializationFilter = (specialization) => {
    setSelectedSpecialization(specialization);
    loadTherapists(specialization === "all" ? "" : specialization);
  };

  const renderTherapist = ({ item, index }) => (
    <Animated.View
      style={[
        styles.therapistCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("BookAppointment", { therapistId: item.id })
        }
        style={styles.cardTouchable}
        activeOpacity={0.9}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarSection}>
            <Image source={{ uri: item.image }} style={styles.avatarImage} />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.therapistName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.specialization}>{item.specialization}</Text>
            <Text style={styles.approach}>{item.approach}</Text>
          </View>

          <View style={styles.ratingSection}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={"yellow"} />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
            <View
              style={[
                styles.availabilityBadge,
                {
                  backgroundColor:
                    item.availability === "Today"
                      ? Colors.status.successLight
                      : Colors.status.infoLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  {
                    color:
                      item.availability === "Today"
                        ? Colors.status.success
                        : Colors.status.info,
                  },
                ]}
              >
                {item.availability}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.experienceContainer}>
            <Ionicons name="briefcase" size={14} color={Colors.text.tertiary} />
            <Text style={styles.experience}>{item.experience} years</Text>
          </View>

          <View style={styles.actionContainer}>
            <View style={styles.rateContainer}>
              <Text style={styles.rate}>${item.rate}</Text>
              <Text style={styles.rateLabel}>/session</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() =>
                navigation.navigate("BookAppointment", { therapistId: item.id })
              }
            >
              
                <Text style={styles.bookButtonText}>Book</Text>
              
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSpecializationChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.specializationChip,
        selectedSpecialization === item.key && styles.specializationChipActive,
      ]}
      onPress={() => handleSpecializationFilter(item.key)}
    >
      <Text
        style={[
          styles.specializationChipText,
          selectedSpecialization === item.key &&
            styles.specializationChipTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View  style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={Colors.text.inverted}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Find Your Therapist</Text>
            <Text style={styles.headerSubtitle}>
              Connect with licensed mental health experts
            </Text>
          </View>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={Colors.text.tertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search therapists or specialties..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchTerm}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Specializations Filter */}
        <View style={styles.specializationsContainer}>
          <FlatList
            data={specializations}
            renderItem={renderSpecializationChip}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specializationsList}
          />
        </View>
      </View>

      {/* Therapists List */}
      <View style={styles.listContainer}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
            <Text style={styles.loadingText}>
              Finding your perfect therapist match...
            </Text>
          </View>
        ) : (
          <FlatList
            data={therapists}
            renderItem={renderTherapist}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.brand.primary]}
                tintColor={Colors.brand.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="heart-outline"
                    size={50}
                    color={Colors.text.tertiary}
                  />
                  <Text style={styles.emptyTitle}>No therapists found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try a different search or filter
                  </Text>
                </View>
              )
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.brand.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.border,
    borderBottomLeftRadius : 40,
    borderBottomRightRadius : 40
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui.overlay,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...getFontStyle("heading2"),
    fontSize: 24,
    color: Colors.text.inverted,
    marginBottom: 2,
  },
  headerSubtitle: {
    ...getFontStyle("bodyMedium"),
    fontSize: 14,
    color: Colors.text.inverted,
    opacity: 0.9,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.neutrals.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.border,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutrals.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...getFontStyle("bodyMedium"),
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  specializationsContainer: {
    marginBottom: 5,
  },
  specializationsList: {
    paddingBottom: 5,
  },
  specializationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.neutrals.surfaceLow,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  specializationChipActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  specializationChipText: {
    ...getFontStyle("bodySmall"),
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  specializationChipTextActive: {
    color: Colors.text.inverted,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    ...getFontStyle("bodyMedium"),
    color: Colors.text.secondary,
    marginTop: 12,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  therapistCard: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  cardTouchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatarSection: {
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: Colors.text.inverted,
    ...getFontStyle("bodyMedium"),
    fontSize: 14,
    fontWeight: "bold",
  },
  infoSection: {
    flex: 1,
    marginRight: 10,
  },
  therapistName: {
    ...getFontStyle("bodyMedium"),
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  specialization: {
    ...getFontStyle("bodySmall"),
    fontSize: 14,
    color: Colors.brand.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  approach: {
    ...getFontStyle("bodySmall"),
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  ratingSection: {
    alignItems: "flex-end",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent.coralLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  rating: {
    ...getFontStyle("bodySmall"),
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    ...getFontStyle("bodySmall"),
    fontSize: 10,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  experienceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  experience: {
    ...getFontStyle("bodySmall"),
    fontSize: 12,
    color: Colors.text.tertiary,
    marginLeft: 6,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateContainer: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  rate: {
    ...getFontStyle("bodyMedium"),
    fontSize: 16,
    fontWeight: "600",
    color: Colors.status.success,
  },
  rateLabel: {
    ...getFontStyle("bodySmall"),
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  bookButton: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor : Colors.brand.primary,
    paddingVertical : 8,
    paddingHorizontal : 16
  },
  bookButtonText: {
    ...getFontStyle("buttonPrimary"),
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    ...getFontStyle("bodyMedium"),
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...getFontStyle("bodySmall"),
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});

export default SearchDoctorsScreen;
