const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create sample risk rules
    const riskRules = [
      {
        name: 'High Pain Level',
        description: 'Very severe pain (9-10/10)',
        category: 'pain_level',
        condition: { painLevel: { gte: 9 } },
        score: 12,
      },
      {
        name: 'Severe Pain Level',
        description: 'Severe pain (7-8/10)',
        category: 'pain_level',
        condition: { painLevel: { gte: 7, lt: 9 } },
        score: 8,
      },
      {
        name: 'Moderate Pain Level',
        description: 'Moderate pain (5-6/10)',
        category: 'pain_level',
        condition: { painLevel: { gte: 5, lt: 7 } },
        score: 5,
      },
      {
        name: 'Chronic Symptoms',
        description: 'Symptoms lasting more than 6 months',
        category: 'duration',
        condition: { duration: 'More than 6 months' },
        score: 5,
      },
      {
        name: 'Severe Functional Limitation',
        description: 'Unable to work or perform activities',
        category: 'functional_impact',
        condition: { workImpact: 'Unable to work/perform activities' },
        score: 8,
      },
      {
        name: 'Red Flags Present',
        description: 'Any red flag symptoms',
        category: 'red_flags',
        condition: { hasRedFlags: true },
        score: 15,
      },
    ];

    for (const rule of riskRules) {
      await prisma.riskRule.upsert({
        where: { name: rule.name },
        update: rule,
        create: rule,
      });
    }

    // Create sample assessment template
    const defaultTemplate = {
      name: 'Default Physiotherapy Assessment',
      description: 'Standard physiotherapy assessment template',
      config: {
        appSettings: {
          title: "PhysioCheck Assessment",
          subtitle: "Professional Physiotherapy Assessment Tool",
          primaryColor: "#ff7b3d",
          secondaryColor: "#f4f4f9",
          textColor: "#333"
        },
        assessmentFlow: [
          {
            id: "body_selection",
            type: "body_diagram",
            title: "Where do you have symptoms?",
            description: "Please select the areas where you are experiencing symptoms.",
            instruction: "Click on the body parts to select them. Selected areas will be highlighted.",
            required: true,
            bodyParts: [
              { id: "head", name: "Head", coordinates: [200, 100] },
              { id: "neck", name: "Neck", coordinates: [200, 140] },
              { id: "shoulder_left", name: "Left Shoulder", coordinates: [160, 180] },
              { id: "shoulder_right", name: "Right Shoulder", coordinates: [240, 180] },
              { id: "chest", name: "Chest", coordinates: [200, 220] },
              { id: "upper_back", name: "Upper Back", coordinates: [200, 200] },
              { id: "lower_back", name: "Lower Back", coordinates: [200, 280] },
              { id: "hip_left", name: "Left Hip", coordinates: [180, 320] },
              { id: "hip_right", name: "Right Hip", coordinates: [220, 320] },
              { id: "knee_left", name: "Left Knee", coordinates: [180, 440] },
              { id: "knee_right", name: "Right Knee", coordinates: [220, 440] }
            ]
          }
        ]
      },
    };

    await prisma.assessmentTemplate.upsert({
      where: { name: defaultTemplate.name },
      update: defaultTemplate,
      create: defaultTemplate,
    });

    // Create sample configuration
    const sampleConfig = {
      key: 'assessment_config',
      value: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        features: {
          analytics: true,
          riskAssessment: true,
          bodyDiagram: true,
        },
      },
      description: 'Main assessment configuration',
    };

    await prisma.configuration.upsert({
      where: { key: sampleConfig.key },
      update: sampleConfig,
      create: sampleConfig,
    });

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase(); 