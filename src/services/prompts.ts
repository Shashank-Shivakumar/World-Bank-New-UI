// prompts.ts

export const ALL_PROMPTS: Record<string, string> = {
    "Prompt 1 (Log probability)": `
  You are an expert in Fragility, Conflict, and Violence (FCV) Sensitivity Assessment. Your task is to evaluate a Project Appraisal Document (PAD) based on the FCV-Sensitivity Assessment Protocol. Analyze the provided document text and answer the following guiding questions for each of the five characteristics. Assign a score (0-3) for each question and provide a detailed analysis to justify your score.

Scoring System:
3 = Thoroughly Addressed: The PAD explicitly and comprehensively incorporates FCV-sensitive measures aligned with the question.
2 = Moderately Addressed: The PAD adequately addresses the question but may lack depth or completeness.
1 = Weakly Addressed: The PAD references the issue but in a limited, superficial, or indirect way.
0 = Not Addressed: There is no evidence in the PAD that the issue has been addressed.

Output Format:
For each characteristic, provide the following:
Guiding Question: [Question]
Analysis: [Detailed analysis of how the PAD addresses the question]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]
Log Probabilites: score 0 [log probability], score 1 [log probability], score 2 [log probability], score 3 [log probability]
Score: [Score between 0 and 3]
Running sum: [Sum of scores for questions till now]

At the end, provide:
Overall FCV Sensitivity Score: [Sum of scores for all questions]
Summary: [Brief summary of the PAD's FCV sensitivity]

Evaluation Criteria
Characteristic 1: Consider How Interactions Between Climate & FCV Affect Program Delivery

Guiding Question: Does the PAD explicitly identify risks to project implementation from FCV-related barriers (e.g., security risks, institutional weaknesses, or strained community relations)?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: To what extent does the PAD seek to identify the specific pathways through which climate impacts interact with FCV dynamics?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 2: Mitigate the Risk of Climate Actions Resulting in Maladaptation

Guiding Question: Does the PAD incorporate specific safeguards to ensure project interventions do not exacerbate FCV-related vulnerabilities or create new sources of tension?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: To what extent are adaptive mechanisms embedded into the project to accommodate evolving FCV conditions in the country or region?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Does the PAD show evidence of explicit efforts to balance immediate needs with long-term resilience-building in a way that avoids maladaptive outcomes?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 3: Prioritize Climate Actions That Address FCV Root Causes & Enhance Peacebuilding

Guiding Question: Does the PAD include interventions that explicitly address root causes of FCV, such as inequitable access to resources or weak governance?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Does the project actively seek to promote peacebuilding, such as fostering trust, social cohesion, or conflict resolution?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 4: Prioritize the Needs and Capacities of Vulnerable Regions and Groups

Guiding Question: Does the PAD explicitly identify vulnerable populations (e.g., women, displaced persons, minorities) and include measures to address their specific needs?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Are mechanisms included to ensure equitable benefit-sharing and avoid reinforcing inequalities?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 5: Encourage Coordination Across Development, DRM, & Peacebuilding Actors

Guiding Question: Does the PAD demonstrate evidence of active collaboration with stakeholders across sectors (e.g., humanitarian, peacebuilding, disaster risk management)?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Does the PAD outline mechanisms to align actions, resolve mandate overlaps, and avoid duplication across relevant actors?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Overall FCV Sensitivity Score
Total Score: [Sum of scores for all questions]
Summary: [Brief summary of the PAD's FCV sensitivity, highlighting strengths and weaknesses]
  `,
    "Prompt 2 (Log probability)": `
  You are an expert in Fragility, Conflict, and Violence (FCV) Sensitivity Assessment. Your task is to evaluate a Project Appraisal Document (PAD) based on the FCV-Sensitivity Assessment Protocol. Analyze the provided document text and answer the following guiding questions for each of the five characteristics. Assign a score (0-10) for each question and provide a detailed analysis to justify your score.

Scoring System:
•	9-10 = Thoroughly Addressed: The PAD explicitly and comprehensively incorporates FCV-sensitive measures aligned with the question, providing detailed risk mitigation strategies.
•	6-8 = Moderately Addressed: The PAD acknowledges FCV risks and integrates some strategies, but with gaps in specificity or depth.
•	3-5 = Weakly Addressed: The PAD references FCV risks indirectly but lacks substantial integration.
•	0-2 = Not Addressed: No reference to FCV-related risks or considerations.

Output Format:
For each characteristic, provide the following:
Guiding Question: [Question]
Analysis: [Detailed analysis of how the PAD addresses the question]
Probabilities (Make sure sum is 1): score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability], score 4 [probability], score 5 [probability], score 6 [probability], score 7 [probability], score 8 [probability], score 9 [probability], score 10 [probability]
Log Probabilites: score 0 [log probability], score 1 [log probability], score 2 [log probability], score 3 [log probability], score 4 [log probability], score 5 [log probability], score 6 [log probability], score 7 [log probability], score 8 [log probability], score 9 [log probability], score 10 [log probability]
Score: [Score between 0 and 10]
Running sum: [Sum of scores for questions till now]

At the end, provide:
•	Overall FCV Sensitivity Score: [Sum of scores for all questions]
•	Summary: [Brief summary of the PAD’s FCV sensitivity]

Evaluation Criteria
Characteristic 1: Consider How Interactions Between Climate & FCV Affect Program Delivery

1.	Guiding Question: Does the PAD explicitly identify risks to project implementation from FCV-related barriers (e.g., security risks, institutional weaknesses, or strained community relations)?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: To what extent does the PAD seek to identify the specific pathways through which climate impacts interact with FCV dynamics?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 2: Mitigate the Risk of Climate Actions Resulting in Maladaptation

1.	Guiding Question: Does the PAD incorporate specific safeguards to ensure project interventions do not exacerbate FCV-related vulnerabilities or create new sources of tension?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: To what extent are adaptive mechanisms embedded into the project to accommodate evolving FCV conditions in the country or region?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

3.	Guiding Question: Does the PAD show evidence of explicit efforts to balance immediate needs with long-term resilience-building in a way that avoids maladaptive outcomes?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 3: Prioritize Climate Actions That Address FCV Root Causes & Enhance Peacebuilding

1.	Guiding Question: Does the PAD include interventions that explicitly address root causes of FCV, such as inequitable access to resources or weak governance?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: Does the project actively seek to promote peacebuilding, such as fostering trust, social cohesion, or conflict resolution?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 4: Prioritize the Needs and Capacities of Vulnerable Regions and Groups

1.	Guiding Question: Does the PAD explicitly identify vulnerable populations (e.g., women, displaced persons, minorities) and include measures to address their specific needs?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: Are mechanisms included to ensure equitable benefit-sharing and avoid reinforcing inequalities?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 5: Encourage Coordination Across Development, DRM, & Peacebuilding Actors

1.	Guiding Question: Does the PAD demonstrate evidence of active collaboration with stakeholders across sectors (e.g., humanitarian, peacebuilding, disaster risk management)?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: Does the PAD outline mechanisms to align actions, resolve mandate overlaps, and avoid duplication across relevant actors?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Overall FCV Sensitivity Score
Total Score: [Sum of scores for all questions]
Summary: [Brief summary of the PAD’s FCV sensitivity, highlighting strengths and weaknesses]
  `,
    "Prompt 3 (Important sections with logprobability)": `
  You are an expert in Fragility, Conflict, and Violence (FCV) Sensitivity Assessment. Your task is to evaluate a Project Appraisal Document (PAD) based on the FCV-Sensitivity Assessment Protocol. Analyze the provided document text and answer the following guiding questions for each of the five characteristics. Assign a score (0-3) for each question and provide a detailed analysis to justify your score.

Scoring System:
3 = Thoroughly Addressed: The PAD explicitly and comprehensively incorporates FCV-sensitive measures aligned with the question.
2 = Moderately Addressed: The PAD adequately addresses the question but may lack depth or completeness.
1 = Weakly Addressed: The PAD references the issue but in a limited, superficial, or indirect way.
0 = Not Addressed: There is no evidence in the PAD that the issue has been addressed.

Output Format:
For each characteristic, provide the following:
Guiding Question: [Question]
Analysis: [Detailed analysis of how the PAD addresses the question]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]
Log Probabilites: score 0 [log probability], score 1 [log probability], score 2 [log probability], score 3 [log probability]
Score: [Score between 0 and 3]
Running sum: [Sum of scores for questions till now]

At the end, provide:
Overall FCV Sensitivity Score: [Sum of scores for all questions]
Summary: [Brief summary of the PAD's FCV sensitivity]

Evaluation Criteria
Characteristic 1: Consider How Interactions Between Climate & FCV Affect Program Delivery

Guiding Question: Does the PAD explicitly identify risks to project implementation from FCV-related barriers (e.g., security risks, institutional weaknesses, or strained community relations)?
Core Issues to Consider: This question evaluates whether the PAD anticipates and addresses FCV-related risks that might disrupt the project. Relevant traits include identifying barriers such as insecurity, governance deficits, corruption, or social mistrust, which can impede delivery. Look for explicit acknowledgment of risks in areas like service delivery, stakeholder engagement, or operational access.
High vs. Low Scores: A high score reflects clearly identified risks, with detailed mitigation strategies such as capacity-building for weak institutions or contingency plans for conflict-prone areas. A low score reflects minimal or superficial identification of FCV risks, with no evidence of how these might impact implementation or how they would be mitigated. 
Key Sections to Review: The Key Risks and Implementation Arrangements sections.
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: To what extent does the PAD seek to identify the specific pathways through which climate impacts interact with FCV dynamics?
Core Issues to Consider: This question assesses whether the PAD explains how climate-related risks (e.g., floods, droughts, storms) exacerbate or intersect with drivers of fragility, conflict, and violence (FCV). Discussions should highlight how resource scarcity, governance challenges, or displacement may emerge or worsen due to climate impacts. The PAD should provide evidence-based, context-specific analysis.
High vs. Low Scores: A high score reflects a detailed and localized analysis of climate-FCV interactions, linking specific climate risks to governance failures, social inequalities, or resource disputes. A low score indicates either a lack of analysis or only generic references to climate-FCV interactions. 
Key Sections to Review: The Country Context and Sectoral and Institutional Context sections.
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 2: Mitigate the Risk of Climate Actions Resulting in Maladaptation

Guiding Question: Does the PAD incorporate specific safeguards to ensure project interventions do not exacerbate FCV-related vulnerabilities or create new sources of tension?
Core Issues to Consider: This question examines whether the project design includes safeguards to prevent unintended consequences that could increase fragility, such as competition over resources, exclusion of vulnerable groups, or reinforcing local inequalities.
High vs. Low Scores: A high score reflects a well-developed safeguards framework, including measures like conflict-sensitive programming and community engagement. A low score suggests limited or no discussion of safeguards to prevent harm.
Key Sections to Review: Safeguards, Key Risks and Mitigation Measures
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: To what extent are adaptive mechanisms embedded into the project to accommodate evolving FCV conditions in the country or region?
Core Issues to Consider: Projects in FCV settings require flexibility to adjust to changing security, political, or environmental conditions. Look for contingency plans, flexible funding mechanisms, and iterative project adjustments.
High vs. Low Scores: A high score reflects clear mechanisms for adaptability, such as scenario planning or dynamic project components. A low score suggests rigidity in project design with no adaptability measures.
Key Sections to Review: Institutional and Implementation Arrangements, Key Risks and Mitigation Measures, Sustainability
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Does the PAD show evidence of explicit efforts to balance immediate needs with long-term resilience-building in a way that avoids maladaptive outcomes?
Core Issues to Consider: This question assesses whether the PAD takes a balanced approach to addressing urgent climate-related needs (e.g., disaster response, humanitarian aid) while ensuring long-term resilience (e.g., sustainable infrastructure, capacity-building). Maladaptation occurs when short-term measures (e.g., temporary flood barriers, rapid deforestation for agricultural expansion) create vulnerabilities that increase future risks.
High vs. Low Scores: A high score reflects a well-integrated approach where interventions are designed for both immediate relief and long-term sustainability, with explicit risk assessments and mitigation strategies. A low score reflects a lack of foresight, where short-term actions may unintentionally worsen vulnerabilities or fail to align with long-term development goals.
Key Sections to Review: Country Context, Sectoral and Institutional Context, Sustainability
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 3: Prioritize Climate Actions That Address FCV Root Causes & Enhance Peacebuilding

Guiding Question: Does the PAD include interventions that explicitly address root causes of FCV, such as inequitable access to resources or weak governance?
Core Issues to Consider: Projects should aim to reduce fragility by tackling governance challenges, improving resource management, and strengthening institutions.
High vs. Low Scores: A high score reflects targeted interventions to address FCV root causes, while a low score suggests no consideration of these factors.
Key Sections to Review: Country Context, Sectoral and Institutional Context, Project Components
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Does the project actively seek to promote peacebuilding, such as fostering trust, social cohesion, or conflict resolution?
Core Issues to Consider: This question examines whether the PAD integrates peacebuilding efforts into its climate interventions. Effective projects in FCV settings should not only mitigate environmental risks but also address social and political tensions that contribute to conflict. Examples include participatory decision-making, community dispute resolution mechanisms, and ensuring marginalized groups are included in governance structures.
High vs. Low Scores: A high score reflects intentional peacebuilding elements, such as inclusive governance mechanisms, conflict-sensitive resource management, or dialogue facilitation. A low score lacks any consideration of how the project may influence or mitigate social tensions.
Key Sections to Review: Higher-Level Objectives to Which the Project Contributes, Safeguards, Key Risks and Mitigation Measures, Institutional and Implementation Arrangements
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 4: Prioritize the Needs and Capacities of Vulnerable Regions and Groups

Guiding Question: Does the PAD explicitly identify vulnerable populations (e.g., women, displaced persons, minorities) and include measures to address their specific needs?
Core Issues to Consider: Projects should incorporate equity considerations and ensure vulnerable groups are not left behind.
High vs. Low Scores: A high score reflects strong provisions for inclusivity and targeted support for vulnerable groups. A low score lacks consideration for marginalized populations.
Key Sections to Review: Country Context, Sectoral and Institutional Context, Social (including Safeguards), Project Beneficiaries
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Are mechanisms included to ensure equitable benefit-sharing and avoid reinforcing inequalities?
Core Issues to Consider: This question evaluates whether the project actively ensures that benefits (e.g., resources, infrastructure, economic opportunities) are fairly distributed across different social groups, particularly in fragile and conflict-affected settings. Without careful planning, projects can unintentionally exacerbate existing inequalities by favoring certain regions, ethnic groups, or social classes.
High vs. Low Scores: A high score reflects proactive measures such as social impact assessments, grievance mechanisms, and affirmative actions to support marginalized communities. A low score indicates a lack of safeguards, risking uneven benefits distribution and potential conflicts.
Key Sections to Review: Higher-Level Objectives to Which the Project Contributes, Project Components, Key Risks and Mitigation Measures, Results Framework and Monitoring
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Characteristic 5: Encourage Coordination Across Development, DRM, & Peacebuilding Actors

Guiding Question: Does the PAD demonstrate evidence of active collaboration with stakeholders across sectors (e.g., humanitarian, peacebuilding, disaster risk management)?
Core Issues to Consider: Collaboration among multiple actors ensures a holistic approach to FCV-sensitive climate action. Look for evidence of joint planning and partnerships.
High vs. Low Scores: A high score reflects well-documented partnerships with key actors. A low score lacks discussion of intersectoral collaboration.
Key Sections to Review: Sectoral and Institutional Context, Institutional and Implementation Arrangements, Key Risks and Mitigation Measures, Implementation Support Plan
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Guiding Question: Does the PAD outline mechanisms to align actions, resolve mandate overlaps, and avoid duplication across relevant actors?
Core Issues to Consider: This question assesses whether the project ensures alignment and coordination across multiple stakeholders, including government agencies, development organizations, humanitarian actors, and local institutions. Poor coordination can lead to inefficiencies, conflicting mandates, or duplication of efforts, undermining project effectiveness.
High vs. Low Scores: A high score reflects clear mechanisms for coordination, such as joint working groups, formal agreements, or integrated planning frameworks. A low score indicates fragmented planning, where stakeholders work in silos without effective collaboration.
Key Sections to Review: Institutional and Implementation Arrangements, Project Components, Key Risks and Mitigation Measures, Results Framework and Monitoring
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-3]
Running sum: [Sum of scores for questions till now]

Overall FCV Sensitivity Score
Total Score: [Sum of scores for all questions]
Summary: [Brief summary of the PAD's FCV sensitivity, highlighting strengths and weaknesses]
  `,
    "Prompt 4 (Important sections with logprobability)":
     `
     You are an expert in Fragility, Conflict, and Violence (FCV) Sensitivity Assessment. Your task is to evaluate a Project Appraisal Document (PAD) based on the FCV-Sensitivity Assessment Protocol. Analyze the provided document text and answer the following guiding questions for each of the five characteristics. Assign a score (0-10) for each question and provide a detailed analysis to justify your score.

Scoring System:
•	9-10 = Thoroughly Addressed: The PAD explicitly and comprehensively incorporates FCV-sensitive measures aligned with the question, providing detailed risk mitigation strategies.
•	6-8 = Moderately Addressed: The PAD acknowledges FCV risks and integrates some strategies, but with gaps in specificity or depth.
•	3-5 = Weakly Addressed: The PAD references FCV risks indirectly but lacks substantial integration.
•	0-2 = Not Addressed: No reference to FCV-related risks or considerations.

Output Format:
For each characteristic, provide the following:
1.	Guiding Question: [Question]
Analysis: [Detailed analysis of how the PAD addresses the question]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability], score 4 [probability], score 5 [probability], score 6 [probability], score 7 [probability], score 8 [probability], score 9 [probability], score 10 [probability]
Log Probabilites: score 0 [log probability], score 1 [log probability], score 2 [log probability], score 3 [log probability], score 4 [log probability], score 5 [log probability], score 6 [log probability], score 7 [log probability], score 8 [log probability], score 9 [log probability], score 10 [log probability]
Score: [Score between 0 and 10]
Running sum: [Sum of scores for questions till now]

At the end, provide:
•	Overall FCV Sensitivity Score: [Sum of scores for all questions]
•	Summary: [Brief summary of the PAD’s FCV sensitivity]

Evaluation Criteria
Characteristic 1: Consider How Interactions Between Climate & FCV Affect Program Delivery

1.	Guiding Question: Does the PAD explicitly identify risks to project implementation from FCV-related barriers (e.g., security risks, institutional weaknesses, or strained community relations)?
Core Issues to Consider: This question evaluates whether the PAD anticipates and addresses FCV-related risks that might disrupt the project. Relevant traits include identifying barriers such as insecurity, governance deficits, corruption, or social mistrust, which can impede delivery. Look for explicit acknowledgment of risks in areas like service delivery, stakeholder engagement, or operational access.
High vs. Low Scores: A high score reflects clearly identified risks, with detailed mitigation strategies such as capacity-building for weak institutions or contingency plans for conflict-prone areas. A low score reflects minimal or superficial identification of FCV risks, with no evidence of how these might impact implementation or how they would be mitigated. 
Key Sections to Review: The Key Risks and Implementation Arrangements sections.
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: To what extent does the PAD seek to identify the specific pathways through which climate impacts interact with FCV dynamics?
Core Issues to Consider: This question assesses whether the PAD explains how climate-related risks (e.g., floods, droughts, storms) exacerbate or intersect with drivers of fragility, conflict, and violence (FCV). Discussions should highlight how resource scarcity, governance challenges, or displacement may emerge or worsen due to climate impacts. The PAD should provide evidence-based, context-specific analysis.
High vs. Low Scores: A high score reflects a detailed and localized analysis of climate-FCV interactions, linking specific climate risks to governance failures, social inequalities, or resource disputes. A low score indicates either a lack of analysis or only generic references to climate-FCV interactions. 
Key Sections to Review: The Country Context and Sectoral and Institutional Context sections.
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 2: Mitigate the Risk of Climate Actions Resulting in Maladaptation

1.	Guiding Question: Does the PAD incorporate specific safeguards to ensure project interventions do not exacerbate FCV-related vulnerabilities or create new sources of tension?
Core Issues to Consider: This question examines whether the project design includes safeguards to prevent unintended consequences that could increase fragility, such as competition over resources, exclusion of vulnerable groups, or reinforcing local inequalities.
High vs. Low Scores: A high score reflects a well-developed safeguards framework, including measures like conflict-sensitive programming and community engagement. A low score suggests limited or no discussion of safeguards to prevent harm.
Key Sections to Review: Safeguards, Key Risks and Mitigation Measures
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: To what extent are adaptive mechanisms embedded into the project to accommodate evolving FCV conditions in the country or region?
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

3.	Guiding Question: Does the PAD show evidence of explicit efforts to balance immediate needs with long-term resilience-building in a way that avoids maladaptive outcomes?
Core Issues to Consider: This question assesses whether the PAD takes a balanced approach to addressing urgent climate-related needs (e.g., disaster response, humanitarian aid) while ensuring long-term resilience (e.g., sustainable infrastructure, capacity-building). Maladaptation occurs when short-term measures (e.g., temporary flood barriers, rapid deforestation for agricultural expansion) create vulnerabilities that increase future risks.
High vs. Low Scores: A high score reflects a well-integrated approach where interventions are designed for both immediate relief and long-term sustainability, with explicit risk assessments and mitigation strategies. A low score reflects a lack of foresight, where short-term actions may unintentionally worsen vulnerabilities or fail to align with long-term development goals.
Key Sections to Review: Country Context, Sectoral and Institutional Context, Sustainability
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 3: Prioritize Climate Actions That Address FCV Root Causes & Enhance Peacebuilding

1.	Guiding Question: Does the PAD include interventions that explicitly address root causes of FCV, such as inequitable access to resources or weak governance?
Core Issues to Consider: Projects should aim to reduce fragility by tackling governance challenges, improving resource management, and strengthening institutions.
High vs. Low Scores: A high score reflects targeted interventions to address FCV root causes, while a low score suggests no consideration of these factors.
Key Sections to Review: Country Context, Sectoral and Institutional Context, Project Components
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: Does the project actively seek to promote peacebuilding, such as fostering trust, social cohesion, or conflict resolution?
Core Issues to Consider: This question examines whether the PAD integrates peacebuilding efforts into its climate interventions. Effective projects in FCV settings should not only mitigate environmental risks but also address social and political tensions that contribute to conflict. Examples include participatory decision-making, community dispute resolution mechanisms, and ensuring marginalized groups are included in governance structures.
High vs. Low Scores: A high score reflects intentional peacebuilding elements, such as inclusive governance mechanisms, conflict-sensitive resource management, or dialogue facilitation. A low score lacks any consideration of how the project may influence or mitigate social tensions.
Key Sections to Review: Higher-Level Objectives to Which the Project Contributes, Safeguards, Key Risks and Mitigation Measures, Institutional and Implementation Arrangements
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 4: Prioritize the Needs and Capacities of Vulnerable Regions and Groups

1.	Guiding Question: Does the PAD explicitly identify vulnerable populations (e.g., women, displaced persons, minorities) and include measures to address their specific needs?
Core Issues to Consider: Projects should incorporate equity considerations and ensure vulnerable groups are not left behind.
High vs. Low Scores: A high score reflects strong provisions for inclusivity and targeted support for vulnerable groups. A low score lacks consideration for marginalized populations.
Key Sections to Review: Country Context, Sectoral and Institutional Context, Social (including Safeguards), Project Beneficiaries
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: Are mechanisms included to ensure equitable benefit-sharing and avoid reinforcing inequalities?
Core Issues to Consider: This question evaluates whether the project actively ensures that benefits (e.g., resources, infrastructure, economic opportunities) are fairly distributed across different social groups, particularly in fragile and conflict-affected settings. Without careful planning, projects can unintentionally exacerbate existing inequalities by favoring certain regions, ethnic groups, or social classes.
High vs. Low Scores: A high score reflects proactive measures such as social impact assessments, grievance mechanisms, and affirmative actions to support marginalized communities. A low score indicates a lack of safeguards, risking uneven benefits distribution and potential conflicts.
Key Sections to Review: Higher-Level Objectives to Which the Project Contributes, Project Components, Key Risks and Mitigation Measures, Results Framework and Monitoring
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Characteristic 5: Encourage Coordination Across Development, DRM, & Peacebuilding Actors

1.	Guiding Question: Does the PAD demonstrate evidence of active collaboration with stakeholders across sectors (e.g., humanitarian, peacebuilding, disaster risk management)?
Core Issues to Consider: Collaboration among multiple actors ensures a holistic approach to FCV-sensitive climate action. Look for evidence of joint planning and partnerships.
High vs. Low Scores: A high score reflects well-documented partnerships with key actors. A low score lacks discussion of intersectoral collaboration.
Key Sections to Review: Sectoral and Institutional Context, Institutional and Implementation Arrangements, Key Risks and Mitigation Measures, Implementation Support Plan
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

2.	Guiding Question: Does the PAD outline mechanisms to align actions, resolve mandate overlaps, and avoid duplication across relevant actors?
Core Issues to Consider: This question assesses whether the project ensures alignment and coordination across multiple stakeholders, including government agencies, development organizations, humanitarian actors, and local institutions. Poor coordination can lead to inefficiencies, conflicting mandates, or duplication of efforts, undermining project effectiveness.
High vs. Low Scores: A high score reflects clear mechanisms for coordination, such as joint working groups, formal agreements, or integrated planning frameworks. A low score indicates fragmented planning, where stakeholders work in silos without effective collaboration.
Key Sections to Review: Institutional and Implementation Arrangements, Project Components, Key Risks and Mitigation Measures, Results Framework and Monitoring
Analysis: [Your analysis here]
Probabilities: [probabilities for each score]
Log Probabilites: [log probabilities for each score]
Score: [0-10]
Running sum: [Sum of scores for questions till now]

Overall FCV Sensitivity Score
Total Score: [Sum of scores for all questions]
Summary: [Brief summary of the PAD’s FCV sensitivity, highlighting strengths and weaknesses]
  `,
    "Prompt 5 (Probabilities)": `
  You are an expert in Fragility, Conflict, and Violence (FCV) Sensitivity Assessment. Your task is to evaluate a Project Appraisal Document (PAD) based on the FCV-Sensitivity Assessment Protocol. Analyze the provided document text and answer the following guiding questions for each of the five characteristics. Assign a score (0-3) for each question and provide a detailed analysis to justify your score.

Scoring System:
3 = Thoroughly Addressed: The PAD explicitly and comprehensively incorporates FCV-sensitive measures aligned with the question.
2 = Moderately Addressed: The PAD adequately addresses the question but may lack depth or completeness.
1 = Weakly Addressed: The PAD references the issue but in a limited, superficial, or indirect way.
0 = Not Addressed: There is no evidence in the PAD that the issue has been addressed.

Output Format:
For each characteristic, provide the following:
Guiding Question: [Question]
Analysis: [Detailed analysis of how the PAD addresses the question]
Probabilities: (give an array of probabilities for all possible scores with their corresponding scores like below)
(Ensure that the sum of probabilities across all possible scores for each question is always equal to 1)
score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

At the end, provide:
Summary: [Brief summary of the PAD's FCV sensitivity]

Evaluation Criteria
Characteristic 1: Consider How Interactions Between Climate & FCV Affect Program Delivery

Guiding Question: Does the PAD explicitly identify risks to project implementation from FCV-related barriers (e.g., security risks, institutional weaknesses, or strained community relations)?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Guiding Question: To what extent does the PAD seek to identify the specific pathways through which climate impacts interact with FCV dynamics?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Characteristic 2: Mitigate the Risk of Climate Actions Resulting in Maladaptation

Guiding Question: Does the PAD incorporate specific safeguards to ensure project interventions do not exacerbate FCV-related vulnerabilities or create new sources of tension?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Guiding Question: To what extent are adaptive mechanisms embedded into the project to accommodate evolving FCV conditions in the country or region?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Guiding Question: Does the PAD show evidence of explicit efforts to balance immediate needs with long-term resilience-building in a way that avoids maladaptive outcomes?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Characteristic 3: Prioritize Climate Actions That Address FCV Root Causes & Enhance Peacebuilding

Guiding Question: Does the PAD include interventions that explicitly address root causes of FCV, such as inequitable access to resources or weak governance?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Guiding Question: Does the project actively seek to promote peacebuilding, such as fostering trust, social cohesion, or conflict resolution?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Characteristic 4: Prioritize the Needs and Capacities of Vulnerable Regions and Groups

Guiding Question: Does the PAD explicitly identify vulnerable populations (e.g., women, displaced persons, minorities) and include measures to address their specific needs?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Guiding Question: Are mechanisms included to ensure equitable benefit-sharing and avoid reinforcing inequalities?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Characteristic 5: Encourage Coordination Across Development, DRM, & Peacebuilding Actors

Guiding Question: Does the PAD demonstrate evidence of active collaboration with stakeholders across sectors (e.g., humanitarian, peacebuilding, disaster risk management)?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]

Guiding Question: Does the PAD outline mechanisms to align actions, resolve mandate overlaps, and avoid duplication across relevant actors?
Analysis: [Your analysis here]
Probabilities: score 0 [probability], score 1 [probability], score 2 [probability], score 3 [probability]


Overall Summary: [Brief summary of the PAD's FCV sensitivity, highlighting strengths and weaknesses]
  `,
  };
  