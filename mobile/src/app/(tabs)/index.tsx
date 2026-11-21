import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SpecialtyChips } from "@/components/SpecialtyChips";
import { colors, SPECIALTIES } from "@/lib/theme";

const perks = [
	{ icon: "✓", title: "Verified doctors", text: "Every doctor on Prescripto is credential-checked before listing." },
	{ icon: "◷", title: "Book in under a minute", text: "Real-time slots, instant confirmation, and free cancellation." },
	{ icon: "🔒", title: "Private by default", text: "Your details go only to the doctor you visit. No data selling." },
];

const steps = [
	{ n: "1", title: "Choose a specialty", text: "Browse trusted doctors by specialty." },
	{ n: "2", title: "Pick a time slot", text: "Find a time that works for you." },
	{ n: "3", title: "Confirm & go", text: "Get an instant confirmation and visit." },
];

const testimonials = [
	{ name: "Sarah T.", text: "Booking took less than a minute and the doctor was excellent." },
	{ name: "Michael B.", text: "Easy to find a specialist and pick a time that suited me." },
];

// Mobile home — mirrors the desktop landing page (hero, perks, specialties,
// how it works, testimonials, CTA). Doctors live on the dedicated Doctors tab.
export default function HomeScreen() {
	const openSpecialty = useCallback((specialty: string | null) => {
		router.navigate({ pathname: "/doctors", params: specialty ? { specialty } : {} });
	}, []);

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
			{/* Hero */}
			<View style={styles.hero}>
				<Text style={styles.brand}>Prescripto</Text>
				<Text style={styles.heroTitle}>Book an Appointment with Trusted Doctors</Text>
				<Text style={styles.heroText}>
					Browse our extensive list of trusted doctors and schedule your appointment hassle-free.
				</Text>
				<Pressable accessibilityRole="button" accessibilityLabel="Book an appointment" style={styles.primaryBtn} onPress={() => router.navigate("/doctors")}>
					<Text style={styles.primaryBtnText}>Book an appointment</Text>
				</Pressable>
			</View>

			{/* Perks */}
			<View style={styles.perks}>
				{perks.map((perk) => (
					<View key={perk.title} style={styles.perk}>
						<View style={styles.perkIcon}><Text style={styles.perkIconText}>{perk.icon}</Text></View>
						<View style={styles.perkBody}>
							<Text style={styles.perkTitle}>{perk.title}</Text>
							<Text style={styles.perkText}>{perk.text}</Text>
						</View>
					</View>
				))}
			</View>

			{/* Specialties */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Browse by specialty</Text>
				<SpecialtyChips selected={null} onSelect={openSpecialty} />
				<Text style={styles.hint}>{SPECIALTIES.length} specialties available</Text>
			</View>

			{/* How it works */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>How it works</Text>
				{steps.map((step) => (
					<View key={step.n} style={styles.step}>
						<View style={styles.stepNum}><Text style={styles.stepNumText}>{step.n}</Text></View>
						<View style={styles.stepBody}>
							<Text style={styles.stepTitle}>{step.title}</Text>
							<Text style={styles.stepText}>{step.text}</Text>
						</View>
					</View>
				))}
			</View>

			{/* Testimonials */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>What patients say</Text>
				{testimonials.map((item) => (
					<View key={item.name} style={styles.quoteCard}>
						<Text style={styles.quote}>\u201C{item.text}\u201D</Text>
						<Text style={styles.quoteName}>— {item.name}</Text>
					</View>
				))}
			</View>

			{/* CTA banner */}
			<View style={styles.banner}>
				<Text style={styles.bannerTitle}>Ready to book?</Text>
				<Text style={styles.bannerText}>Find a trusted doctor and pick a time in minutes.</Text>
				<Pressable accessibilityRole="button" accessibilityLabel="Find doctors" style={styles.bannerBtn} onPress={() => router.navigate("/doctors")}>
					<Text style={styles.bannerBtnText}>Find doctors</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.background },
	content: { paddingBottom: 32 },
	hero: { backgroundColor: colors.primaryDark, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 26, gap: 10 },
	brand: { color: "#ffffff", fontSize: 15, fontWeight: "800", letterSpacing: 1 },
	heroTitle: { color: "#ffffff", fontSize: 27, fontWeight: "800", lineHeight: 33 },
	heroText: { color: "#d1fae5", fontSize: 14, lineHeight: 21 },
	primaryBtn: { alignSelf: "flex-start", backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 11, paddingHorizontal: 20, marginTop: 6 },
	primaryBtnText: { color: colors.primaryDark, fontWeight: "800", fontSize: 14 },
	perks: { gap: 10, paddingHorizontal: 16, paddingTop: 18 },
	perk: { flexDirection: "row", gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 },
	perkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
	perkIconText: { color: colors.primary, fontSize: 18, fontWeight: "800" },
	perkBody: { flex: 1, gap: 3 },
	perkTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
	perkText: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
	section: { paddingHorizontal: 16, paddingTop: 24 },
	sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 10 },
	hint: { color: colors.textMuted, fontSize: 12, marginTop: 6, paddingHorizontal: 16 },
	step: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 8 },
	stepNum: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
	stepNumText: { color: "#ffffff", fontWeight: "800", fontSize: 15 },
	stepBody: { flex: 1, gap: 2 },
	stepTitle: { color: colors.text, fontWeight: "800", fontSize: 14 },
	stepText: { color: colors.textMuted, fontSize: 12 },
	quoteCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
	quote: { color: colors.text, fontSize: 14, lineHeight: 20, fontStyle: "italic" },
	quoteName: { color: colors.primary, fontWeight: "800", fontSize: 12, marginTop: 8 },
	banner: { marginHorizontal: 16, marginTop: 12, backgroundColor: colors.primary, borderRadius: 18, padding: 20, alignItems: "center", gap: 6 },
	bannerTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
	bannerText: { color: "#d1fae5", fontSize: 13, textAlign: "center" },
	bannerBtn: { backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 10, paddingHorizontal: 22, marginTop: 8 },
	bannerBtnText: { color: colors.primary, fontWeight: "800", fontSize: 14 },
});
