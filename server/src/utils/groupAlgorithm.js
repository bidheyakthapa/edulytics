export function computeComposite(student) {
  const { frontend_level, backend_level, mobile_level, uiux_level, topics } =
    student;

  const skillAvg =
    (frontend_level + backend_level + mobile_level + uiux_level) / 4;
  const skillScore = skillAvg / 5;

  const quizScore =
    topics.length > 0
      ? topics.reduce((sum, t) => sum + t.p_know, 0) / topics.length
      : 0;

  return skillScore * 0.4 + quizScore * 0.6;
}

export function getDominantSkill(student) {
  const skills = {
    frontend: student.frontend_level,
    backend: student.backend_level,
    mobile: student.mobile_level,
    uiux: student.uiux_level,
  };
  return Object.entries(skills).sort((a, b) => b[1] - a[1])[0][0];
}

export function serpentineDraft(students, groupCount) {
  const groups = Array.from({ length: groupCount }, () => []);

  students.forEach((student, i) => {
    const round = Math.floor(i / groupCount);
    const posInRound = i % groupCount;
    const groupIndex =
      round % 2 === 0 ? posInRound : groupCount - 1 - posInRound;
    groups[groupIndex].push(student);
  });

  return groups;
}

export function greedySkillSwap(groups) {
  const allSkills = ["frontend", "backend", "mobile", "uiux"];

  for (let i = 0; i < groups.length; i++) {
    const presentSkills = new Set(groups[i].map(getDominantSkill));
    const missingSkills = allSkills.filter((s) => !presentSkills.has(s));

    for (const missing of missingSkills) {
      for (let j = 0; j < groups.length; j++) {
        if (i === j) continue;

        const candidateIndex = groups[j].findIndex(
          (s) => getDominantSkill(s) === missing,
        );
        if (candidateIndex === -1) continue;

        const swapOutIndex = groups[i].findIndex((s) => {
          const skill = getDominantSkill(s);
          return (
            groups[i].filter((m) => getDominantSkill(m) === skill).length > 1
          );
        });

        if (swapOutIndex === -1) continue;

        const temp = groups[i][swapOutIndex];
        groups[i][swapOutIndex] = groups[j][candidateIndex];
        groups[j][candidateIndex] = temp;
        break;
      }
    }
  }

  return groups;
}
