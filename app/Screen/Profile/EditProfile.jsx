// components/EditProfile.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Keyboard,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  FontAwesome,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { getSession, saveSession } from "../../utils/session";
import { updateUserProfile } from "../../Services/api";
import Colors from "../../assets/colors";
import SuccessModal from "../../components/SuccessModal";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

const EditProfile = ({ navigation, route }) => {
  const { username } = route.params || {};

  const [profileImage, setProfileImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const genderOptions = [
    { label: "Male", value: "male", icon: "male", color: Colors.brand.primary },
    { label: "Female", value: "female", icon: "female", color: Colors.brand.secondary },
    { label: "Other", value: "other", icon: "person-outline", color: Colors.brand.accent },
    {
      label: "Prefer not to say",
      value: "prefer_not_to_say",
      icon: "eye-off-outline",
      color: Colors.text.tertiary,
    },
  ];

  const countryOptions = [
    { code: "+92", name: "Pakistan", flag: "🇵🇰", maxLength: 10 },
    { code: "+91", name: "India", flag: "🇮🇳", maxLength: 10 },
    { code: "+1", name: "USA", flag: "🇺🇸", maxLength: 10 },
    { code: "+44", name: "UK", flag: "🇬🇧", maxLength: 10 },
    { code: "+971", name: "UAE", flag: "🇦🇪", maxLength: 9 },
    { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", maxLength: 9 },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  // Profile Image Selection Handlers
  const handleTakePhoto = async () => {
    setPhotoSheetVisible(false);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error("Camera launch error:", e);
      Alert.alert("Camera Error", "Could not open camera. Please check camera permissions.");
    }
  };

  const handleChooseFromGallery = async () => {
    setPhotoSheetVisible(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error("Gallery launch error:", e);
      Alert.alert("Gallery Error", "Could not open gallery.");
    }
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .min(2, "Full name must be at least 2 characters")
      .required("Full name is required"),
    gender: Yup.string().required("Please select your gender"),
    birthDate: Yup.date().nullable().required("Birth date is required"),
    countryCode: Yup.string().required("Country code is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(7, "Phone number is too short")
      .required("Phone number is required"),
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.96,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();

      const userSession = await getSession();

      if (!userSession || !userSession.id) {
        Alert.alert("Error", "User not logged in. Please login again.");
        navigation.navigate("Login");
        return;
      }

      const formData = new FormData();
      formData.append("user_id", userSession.id);
      formData.append("email", userSession.email);
      formData.append("full_name", values.fullName);
      formData.append("gender", values.gender);
      formData.append("date_of_birth", values.birthDate.toISOString().split("T")[0]);

      const fullPhoneNumber = `${values.countryCode}${values.phoneNumber}`;
      formData.append("phone_number", fullPhoneNumber);

      if (profileImage) {
        let filename = profileImage.split("/").pop() || "profile.jpg";
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("profile_image", {
          uri: profileImage,
          name: filename,
          type: type,
        });
      }

      const response = await updateUserProfile(formData);

      const updatedUser = {
        ...userSession,
        full_name: values.fullName,
        gender: values.gender,
        date_of_birth: values.birthDate.toISOString().split("T")[0],
        phone_number: fullPhoneNumber,
        hasCompletedProfile: true,
        profile_image: response.user?.profile_image || profileImage,
      };
      await saveSession(updatedUser);

      setModalMessage("Your profile has been updated successfully!");
      setIsModalVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Profile update error:", error.message);
      Alert.alert("Update Error", error.message || "Failed to update profile. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedirectToHealthGoal = () => {
    setIsModalVisible(false);
    navigation.navigate("HealthGoal");
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Modern App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <View style={styles.stepBadgeContainer}>
              <Text style={styles.stepBadgeText}>STEP 2 OF 2</Text>
            </View>
            <Text style={styles.topBarTitle}>Complete Profile</Text>
          </View>

          <View style={styles.topBarRightSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={() => setPhotoSheetVisible(true)}
                activeOpacity={0.85}
                style={styles.avatarWrapper}
              >
                <LinearGradient
                  colors={["#5A8DEE", "#7B61FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradientRing}
                >
                  <View style={styles.avatarInnerContainer}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <FontAwesome name="user" size={42} color="#94A3B8" />
                      </View>
                    )}
                  </View>
                </LinearGradient>

                <View style={styles.cameraBadge}>
                  <Feather name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to upload photo</Text>
            </View>

            {/* Form */}
            <Formik
              initialValues={{
                fullName: username || "",
                gender: "",
                birthDate: null,
                countryCode: "+92",
                phoneNumber: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
              }) => {
                const selectedCountry =
                  countryOptions.find((opt) => opt.code === values.countryCode) ||
                  countryOptions[0];

                return (
                  <View style={styles.formCard}>
                    {/* Full Name */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Full Name</Text>
                      <View
                        style={[
                          styles.inputBox,
                          touched.fullName && errors.fullName && styles.inputBoxError,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="#5A8DEE"
                          style={styles.fieldIcon}
                        />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Your legal full name"
                          placeholderTextColor="#94A3B8"
                          value={values.fullName}
                          onChangeText={handleChange("fullName")}
                          onBlur={handleBlur("fullName")}
                        />
                      </View>
                      {touched.fullName && errors.fullName && (
                        <Text style={styles.errorText}>{errors.fullName}</Text>
                      )}
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Gender</Text>
                      <TouchableOpacity
                        style={[
                          styles.inputBox,
                          touched.gender && errors.gender && styles.inputBoxError,
                        ]}
                        onPress={() => setGenderModalVisible(true)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="people-outline"
                          size={20}
                          color="#5A8DEE"
                          style={styles.fieldIcon}
                        />
                        <Text
                          style={[
                            styles.selectorText,
                            !values.gender && styles.placeholderText,
                          ]}
                        >
                          {values.gender
                            ? genderOptions.find((g) => g.value === values.gender)?.label
                            : "Select your gender"}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color="#64748B" />
                      </TouchableOpacity>
                      {touched.gender && errors.gender && (
                        <Text style={styles.errorText}>{errors.gender}</Text>
                      )}
                    </View>

                    {/* Birth Date */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Date of Birth</Text>
                      <TouchableOpacity
                        style={[
                          styles.inputBox,
                          touched.birthDate && errors.birthDate && styles.inputBoxError,
                        ]}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#5A8DEE"
                          style={styles.fieldIcon}
                        />
                        <Text
                          style={[
                            styles.selectorText,
                            !values.birthDate && styles.placeholderText,
                          ]}
                        >
                          {values.birthDate
                            ? formatDate(values.birthDate)
                            : "Select your birth date"}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color="#64748B" />
                      </TouchableOpacity>
                      {touched.birthDate && errors.birthDate && (
                        <Text style={styles.errorText}>{errors.birthDate}</Text>
                      )}

                      {showDatePicker && (
                        <DateTimePicker
                          value={values.birthDate || new Date(2000, 0, 1)}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          maximumDate={new Date()}
                          onChange={(event, date) => {
                            setShowDatePicker(Platform.OS === "ios");
                            if (date) {
                              setFieldValue("birthDate", date);
                            }
                          }}
                        />
                      )}
                    </View>

                    {/* High-Contrast Phone Number Input */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Phone Number</Text>
                      <View
                        style={[
                          styles.phoneInputContainer,
                          touched.phoneNumber && errors.phoneNumber && styles.inputBoxError,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.countryPickerButton}
                          onPress={() => setCountryModalVisible(true)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.countryFlagText}>{selectedCountry.flag}</Text>
                          <Text style={styles.countryCodeValue}>{values.countryCode}</Text>
                          <Ionicons name="chevron-down" size={14} color="#475569" />
                        </TouchableOpacity>

                        <View style={styles.phoneDivider} />

                        <View style={styles.phoneInputField}>
                          <Ionicons
                            name="call-outline"
                            size={18}
                            color="#5A8DEE"
                            style={styles.phoneIcon}
                          />
                          <TextInput
                            style={styles.phoneTextInput}
                            placeholder="300 1234567"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            maxLength={selectedCountry.maxLength}
                            value={values.phoneNumber}
                            onChangeText={handleChange("phoneNumber")}
                            onBlur={handleBlur("phoneNumber")}
                          />
                        </View>
                      </View>
                      {touched.phoneNumber && errors.phoneNumber && (
                        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                      )}
                    </View>

                    {/* Submit Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 20 }}>
                      <TouchableOpacity
                        style={styles.submitButtonWrapper}
                        onPress={handleSubmit}
                        activeOpacity={0.9}
                        disabled={isSubmitting}
                      >
                        <LinearGradient
                          colors={["#5A8DEE", "#7B61FF"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitGradient}
                        >
                          <Text style={styles.submitButtonText}>
                            {isSubmitting ? "Saving Profile..." : "Save & Continue"}
                          </Text>
                          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                );
              }}
            </Formik>
          </Animated.View>
        </ScrollView>

        {/* 📸 Modern Image Picker Action Sheet */}
        <Modal
          visible={photoSheetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPhotoSheetVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setPhotoSheetVisible(false)}
          >
            <View style={styles.actionSheetContainer}>
              <View style={styles.actionSheetHandle} />
              <Text style={styles.actionSheetTitle}>Profile Photo</Text>
              <Text style={styles.actionSheetSubtitle}>Select how you would like to add a photo</Text>

              <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.actionOptionIcon, { backgroundColor: "#EEF4FF" }]}>
                  <Ionicons name="camera" size={22} color="#5A8DEE" />
                </View>
                <View style={styles.actionOptionTextContainer}>
                  <Text style={styles.actionOptionLabel}>Take Photo</Text>
                  <Text style={styles.actionOptionSub}>Use your camera to take a new picture</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={handleChooseFromGallery}
                activeOpacity={0.7}
              >
                <View style={[styles.actionOptionIcon, { backgroundColor: "#F3EEFF" }]}>
                  <Ionicons name="images" size={22} color="#7B61FF" />
                </View>
                <View style={styles.actionOptionTextContainer}>
                  <Text style={styles.actionOptionLabel}>Choose from Gallery</Text>
                  <Text style={styles.actionOptionSub}>Pick an existing photo from library</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionSheetCancel}
                onPress={() => setPhotoSheetVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Gender Selection Modal */}
        <Modal
          visible={genderModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setGenderModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setGenderModalVisible(false)}
          >
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Select Gender</Text>
                <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Formik initialValues={{}} onSubmit={() => {}}>
                {({ setFieldValue }) => (
                  <View style={styles.dialogList}>
                    {genderOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={styles.dialogItem}
                        onPress={() => {
                          setFieldValue("gender", opt.value);
                          setGenderModalVisible(false);
                        }}
                      >
                        <View style={[styles.dialogItemIcon, { backgroundColor: opt.color + "18" }]}>
                          <Ionicons name={opt.icon} size={20} color={opt.color} />
                        </View>
                        <Text style={styles.dialogItemLabel}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Formik>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Country Code Modal */}
        <Modal
          visible={countryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCountryModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCountryModalVisible(false)}
          >
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Select Country Code</Text>
                <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Formik initialValues={{}} onSubmit={() => {}}>
                {({ setFieldValue }) => (
                  <View style={styles.dialogList}>
                    {countryOptions.map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={styles.dialogItem}
                        onPress={() => {
                          setFieldValue("countryCode", item.code);
                          setCountryModalVisible(false);
                        }}
                      >
                        <Text style={styles.countryFlagLarge}>{item.flag}</Text>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.countryNameText}>{item.name}</Text>
                          <Text style={styles.countryCodeSub}>{item.code}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Formik>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Success Modal */}
        <SuccessModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          title="Profile Updated!"
          message={modalMessage || "Your profile has been updated successfully!"}
          redirectTo="HealthGoal"
          autoRedirectDuration={4000}
          onRedirect={handleRedirectToHealthGoal}
          showConfetti={true}
          animationSource={require("../../assets/json/Blue Checkmark.json")}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarCenter: {
    alignItems: "center",
  },
  stepBadgeContainer: {
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 2,
  },
  stepBadgeText: {
    color: "#5A8DEE",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  topBarRightSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  contentContainer: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarGradientRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5A8DEE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarInnerContainer: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5A8DEE",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#5A8DEE",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  placeholderText: {
    color: "#94A3B8",
    fontWeight: "400",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    overflow: "hidden",
  },
  countryPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: "100%",
    backgroundColor: "#F1F5F9",
  },
  countryFlagText: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCodeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 4,
  },
  phoneDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#CBD5E1",
  },
  phoneInputField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: "100%",
  },
  phoneIcon: {
    marginRight: 8,
  },
  phoneTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  submitButtonWrapper: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#5A8DEE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  actionSheetSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  actionSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    marginBottom: 10,
  },
  actionOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionOptionTextContainer: {
    flex: 1,
  },
  actionOptionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionOptionSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  actionSheetCancel: {
    marginTop: 6,
    paddingVertical: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    alignItems: "center",
  },
  actionSheetCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  /* Dialogs */
  dialogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: "auto",
    marginTop: "auto",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  dialogList: {
    gap: 8,
  },
  dialogItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  dialogItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dialogItemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  countryFlagLarge: {
    fontSize: 24,
  },
  countryNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  countryCodeSub: {
    fontSize: 13,
    color: "#5A8DEE",
    fontWeight: "600",
    marginTop: 2,
  },
});

export default EditProfile;
