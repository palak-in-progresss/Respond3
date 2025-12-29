import type { Database } from '../../types/database';

type Volunteer = Database['public']['Tables']['volunteers']['Row'];
type Request = Database['public']['Tables']['requests']['Row'];

export interface MatchScore {
    volunteer: Volunteer;
    score: number;
    breakdown: {
        skillMatch: number;
        locationScore: number;
        availabilityScore: number;
        experienceScore: number;
    };
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get max radius based on urgency
function getMaxRadius(urgency: string): number {
    switch (urgency) {
        case 'high':
            return 5; // 5km for high urgency
        case 'medium':
            return 10; // 10km for medium urgency
        case 'low':
            return 20; // 20km for low urgency
        default:
            return 10;
    }
}

// Calculate skill match score (0-100)
function calculateSkillScore(
    volunteerSkills: string[],
    requiredSkills: string[]
): number {
    if (requiredSkills.length === 0) return 100;

    const matchedSkills = requiredSkills.filter((skill) =>
        volunteerSkills.some((vSkill) =>
            vSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(vSkill.toLowerCase())
        )
    );

    return (matchedSkills.length / requiredSkills.length) * 100;
}

// Calculate location score (0-100)
function calculateLocationScore(
    distance: number,
    maxRadius: number
): number {
    if (distance > maxRadius) return 0;
    return ((maxRadius - distance) / maxRadius) * 100;
}

// Calculate availability score (0-100)
function calculateAvailabilityScore(status: string): number {
    switch (status) {
        case 'available':
            return 100;
        case 'busy':
            return 30;
        case 'offline':
            return 0;
        default:
            return 0;
    }
}

// Calculate experience score (0-100)
function calculateExperienceScore(
    rating: number,
    tasksCompleted: number
): number {
    const ratingScore = (rating / 5) * 60; // Max 60 points from rating
    const experienceScore = Math.min(tasksCompleted * 2, 40); // Max 40 points from tasks
    return ratingScore + experienceScore;
}

// Main matching function
export function matchVolunteersToRequest(
    volunteers: Volunteer[],
    request: Request
): MatchScore[] {
    const maxRadius = getMaxRadius(request.urgency);
    const matches: MatchScore[] = [];

    for (const volunteer of volunteers) {
        // Skip if not verified
        if (volunteer.verification_status !== 'verified') continue;

        // Calculate distance if coordinates available
        let distance = 0;
        let locationScore = 50; // Default score if no coordinates

        if (
            volunteer.latitude &&
            volunteer.longitude &&
            request.latitude &&
            request.longitude
        ) {
            distance = calculateDistance(
                volunteer.latitude,
                volunteer.longitude,
                request.latitude,
                request.longitude
            );

            // Skip if too far
            if (distance > maxRadius) continue;

            locationScore = calculateLocationScore(distance, maxRadius);
        }

        // Calculate individual scores
        const skillMatch = calculateSkillScore(
            volunteer.skills,
            request.skills_needed
        );
        const availabilityScore = calculateAvailabilityScore(
            volunteer.availability_status
        );
        const experienceScore = calculateExperienceScore(
            volunteer.rating,
            volunteer.tasks_completed
        );

        // Skip if skill match is too low (less than 50%)
        if (skillMatch < 50) continue;

        // Calculate weighted composite score
        const compositeScore =
            skillMatch * 0.4 +
            locationScore * 0.3 +
            availabilityScore * 0.2 +
            experienceScore * 0.1;

        matches.push({
            volunteer,
            score: Math.round(compositeScore),
            breakdown: {
                skillMatch: Math.round(skillMatch),
                locationScore: Math.round(locationScore),
                availabilityScore: Math.round(availabilityScore),
                experienceScore: Math.round(experienceScore),
            },
        });
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return matches;
}

// Get top N matches
export function getTopMatches(
    volunteers: Volunteer[],
    request: Request,
    limit: number = 10
): MatchScore[] {
    const allMatches = matchVolunteersToRequest(volunteers, request);
    return allMatches.slice(0, limit);
}

// Quick match check - returns true if volunteer is a good match
export function isGoodMatch(
    volunteer: Volunteer,
    request: Request,
    minScore: number = 60
): boolean {
    const matches = matchVolunteersToRequest([volunteer], request);
    return matches.length > 0 && matches[0].score >= minScore;
}
