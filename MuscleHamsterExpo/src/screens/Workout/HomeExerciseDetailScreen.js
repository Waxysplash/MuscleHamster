// At Home exercise page - fast set logging, weight optional (see ExerciseLogView)
import React from 'react';
import ExerciseLogView from './ExerciseLogView';

export default function HomeExerciseDetailScreen({ route, navigation }) {
  const { exercise, category } = route.params;
  return (
    <ExerciseLogView
      navigation={navigation}
      exercise={exercise}
      groupName={category?.name}
      fallbackKey="home"
      subtitle={category?.name ? `${category.name} · At home` : 'At home'}
      weightOptional
    />
  );
}
