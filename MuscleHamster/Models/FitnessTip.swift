//
//  FitnessTip.swift
//  MuscleHamster
//
//  Short bite-sized fitness tips and facts for the home screen
//  Rotates daily using day-of-year index — pure static data, no service needed
//

import Foundation

// MARK: - Fitness Tip

struct FitnessTip: Identifiable, Equatable {
    let id: String
    let text: String
    let category: TipCategory

    enum TipCategory: String, CaseIterable {
        case nutrition
        case exercise
        case recovery
        case mindset
        case funFact

        var displayName: String {
            switch self {
            case .nutrition: return "Nutrition"
            case .exercise: return "Exercise"
            case .recovery: return "Recovery"
            case .mindset: return "Mindset"
            case .funFact: return "Fun Fact"
            }
        }

        var icon: String {
            switch self {
            case .nutrition: return "carrot.fill"
            case .exercise: return "figure.run"
            case .recovery: return "bed.double.fill"
            case .mindset: return "brain.head.profile.fill"
            case .funFact: return "sparkles"
            }
        }
    }

    // MARK: - Tip Pool (~40 tips)

    static let pool: [FitnessTip] = [
        // Nutrition
        FitnessTip(id: "n1", text: "Drinking water before a meal can help you feel fuller and stay hydrated during your workout.", category: .nutrition),
        FitnessTip(id: "n2", text: "Bananas are a great pre-workout snack — they're packed with natural energy and potassium.", category: .nutrition),
        FitnessTip(id: "n3", text: "Protein helps repair your muscles after exercise. Try to eat some within an hour of working out.", category: .nutrition),
        FitnessTip(id: "n4", text: "Eating colorful fruits and vegetables gives your body a variety of important vitamins.", category: .nutrition),
        FitnessTip(id: "n5", text: "Staying hydrated helps your body recover faster. Aim for at least 8 glasses of water a day.", category: .nutrition),
        FitnessTip(id: "n6", text: "Healthy fats from nuts, avocados, and olive oil help your body absorb vitamins.", category: .nutrition),
        FitnessTip(id: "n7", text: "Eating a small snack 30-60 minutes before exercise can boost your energy and performance.", category: .nutrition),
        FitnessTip(id: "n8", text: "Dark chocolate (in moderation!) contains antioxidants that may help reduce muscle soreness.", category: .nutrition),

        // Exercise
        FitnessTip(id: "e1", text: "Even 10 minutes of exercise can boost your mood and energy for the rest of the day.", category: .exercise),
        FitnessTip(id: "e2", text: "Warming up before exercise helps prevent injuries and gets your muscles ready to work.", category: .exercise),
        FitnessTip(id: "e3", text: "Good form is more important than doing more reps. Quality over quantity!", category: .exercise),
        FitnessTip(id: "e4", text: "Walking is one of the best exercises for overall health — and it's free!", category: .exercise),
        FitnessTip(id: "e5", text: "Mixing up your workouts prevents boredom and works different muscle groups.", category: .exercise),
        FitnessTip(id: "e6", text: "Bodyweight exercises like push-ups and squats can be done anywhere, no equipment needed.", category: .exercise),
        FitnessTip(id: "e7", text: "Stretching after a workout helps your muscles cool down and can reduce stiffness.", category: .exercise),
        FitnessTip(id: "e8", text: "Your body gets stronger during rest, not during the workout itself. Recovery matters!", category: .exercise),

        // Recovery
        FitnessTip(id: "r1", text: "Getting 7-9 hours of sleep helps your muscles repair and grow stronger.", category: .recovery),
        FitnessTip(id: "r2", text: "Rest days aren't lazy days — they're when your body rebuilds and gets stronger.", category: .recovery),
        FitnessTip(id: "r3", text: "Gentle stretching or a short walk on rest days can help reduce muscle soreness.", category: .recovery),
        FitnessTip(id: "r4", text: "Listening to your body is a skill. If something hurts, it's okay to take a break.", category: .recovery),
        FitnessTip(id: "r5", text: "Deep breathing exercises can help reduce stress and speed up recovery.", category: .recovery),
        FitnessTip(id: "r6", text: "Foam rolling can help loosen tight muscles and improve your range of motion.", category: .recovery),
        FitnessTip(id: "r7", text: "Taking a warm bath after a tough workout can help relax sore muscles.", category: .recovery),
        FitnessTip(id: "r8", text: "Overtraining can actually slow your progress. Balance hard days with easy ones.", category: .recovery),

        // Mindset
        FitnessTip(id: "m1", text: "Progress isn't always visible. Trust the process and celebrate small wins.", category: .mindset),
        FitnessTip(id: "m2", text: "Showing up is the hardest part. Once you start, you've already won.", category: .mindset),
        FitnessTip(id: "m3", text: "Comparing yourself to others steals your joy. Focus on YOUR journey.", category: .mindset),
        FitnessTip(id: "m4", text: "Consistency beats intensity. A little bit every day adds up to big results.", category: .mindset),
        FitnessTip(id: "m5", text: "It's okay to have off days. What matters is that you keep coming back.", category: .mindset),
        FitnessTip(id: "m6", text: "Setting small, achievable goals builds confidence and keeps you motivated.", category: .mindset),
        FitnessTip(id: "m7", text: "Your mindset is your strongest muscle. Train it with positive self-talk.", category: .mindset),
        FitnessTip(id: "m8", text: "Every workout you do is an investment in your future self. You're worth it!", category: .mindset),

        // Fun Facts
        FitnessTip(id: "f1", text: "Your body has over 600 muscles! Even smiling uses about 12 of them.", category: .funFact),
        FitnessTip(id: "f2", text: "Laughing is actually a mini workout — it engages your core and burns a few calories.", category: .funFact),
        FitnessTip(id: "f3", text: "The human heart beats about 100,000 times per day. Exercise makes each beat stronger!", category: .funFact),
        FitnessTip(id: "f4", text: "Dancing counts as exercise! Put on your favorite song and move for a quick mood boost.", category: .funFact),
        FitnessTip(id: "f5", text: "Hamsters can run up to 5.5 miles on their wheel in a single night. Your hamster buddy is rooting for you!", category: .funFact),
        FitnessTip(id: "f6", text: "Exercise releases endorphins — your brain's natural 'feel good' chemicals.", category: .funFact),
        FitnessTip(id: "f7", text: "Astronauts exercise 2 hours every day in space to keep their muscles from shrinking!", category: .funFact),
        FitnessTip(id: "f8", text: "Your bones get stronger with exercise too, not just your muscles. Weight-bearing activities rock!", category: .funFact),
    ]

    // MARK: - Daily Tip Selection

    /// Get today's tip (deterministic by day-of-year, rotates daily)
    static func todaysTip() -> FitnessTip {
        let calendar = Calendar.current
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: Date()) ?? 1
        let index = (dayOfYear - 1) % pool.count
        return pool[index]
    }
}
