// Gym exercise page - fast set logging (see ExerciseLogView)
import React from 'react';
import ExerciseLogView from './ExerciseLogView';

export default function GymExerciseDetailScreen({ route, navigation }) {
  const { exercise, bodyPart } = route.params;
  return (
    <ExerciseLogView
      navigation={navigation}
      exercise={exercise}
      groupName={bodyPart?.name}
      fallbackKey="gym"
      subtitle={bodyPart?.name ? `${bodyPart.name} · Gym` : 'Gym'}
    />
  );
}
