import { gql } from "graphql-tag";
import { context } from "./server.js";

export const typeDefs = gql`


  type Skill {
    id: ID @id
    name: String! @unique
    category: String
    siblingSkills: [Skill!]! @cypher(statement: """
        MATCH (this)-[:HAS_PARENT_SKILL]->(s:Skill)-[:CONTAINS_SKILL]->(sibling:Skill) 
        WHERE sibling.name <> this.name 
        RETURN sibling"""
    )
  }

  type Person {
    id: ID @id
    name: String!
    type: String!
    hasSkills: [Skill] @cypher(statement: "MATCH (this)-[:HAS_SKILL]->(s:Skill) RETURN s as hasSkills;")
    matchProjects: [ProjectMatchResult]!
    skills: [Skill!]! @relationship(type: "HAS_SKILL", direction: OUT)
  }


  type Project {
    id: ID @id
    name: String! @unique
    useSkills: [Skill!]! @relationship(type: "USES_SKILL", direction: OUT)
    matchPeople: [PeopleMatchResult]!
  }

  input SkillInput {
    name: String!
    description: String
    category: String
  }

  input PersonInput {
    id: ID 
    name: String!
  }

  input ProjectInput {
    id: ID 
    name: String!
  }

  type ProjectMatchResult {
    project: Project
    coverage_score: Float
    missed_skills: [String]
    similar_missed_skills: [String]
  }

  type PeopleMatchResult {
    people: Person
    coverage_score: Float
    missed_skills: [String]
    similar_missed_skills: [String]
  }

`;

export const resolvers = {
    Person: {

        matchProjects: (person: any) => {
            let session = context().driver.session();
            let params = {name: person.name};
            let query = `
            MATCH (p: Person)-[:HAS_SKILL]->(s:Skill)<-[:USES_SKILL]-(pr:Project)
                WHERE toLower(p.name) = toLower($name)
            MATCH (pr)-[:USES_SKILL]->(req_skill:Skill)
            MATCH (p)-[:HAS_SKILL]-(had_skills:Skill)
            WITH 
                p, 
                pr, 
                COLLECT(DISTINCT s.name) AS shared_skills, 
                COLLECT(DISTINCT req_skill.name) AS required_skills, 
                COLLECT(DISTINCT had_skills.name) AS had_skills
            UNWIND had_skills AS hs
            UNWIND required_skills as rs
            UNWIND shared_skills as ss
            MATCH (parent:Skill)<-[:HAS_PARENT_SKILL]-(child:Skill) WHERE (child.name IN [skill in required_skills WHERE NOT skill IN had_skills])
            MATCH (parent)-[:CONTAINS_SKILL]->(sub_skill:Skill)
            WHERE (NOT sub_skill.name IN ss) AND (sub_skill.name in hs) AND (NOT sub_skill.name IN rs)

            WITH 
                p, 
                pr, 
                required_skills, 
                COLLECT(DISTINCT sub_skill.name) AS similar_missed_skills, 
                had_skills, 
                shared_skills, 
                [skill in required_skills WHERE NOT skill IN had_skills] AS missed_skills
            RETURN 
                pr AS project, 
                p AS person, round(toFloat(size(shared_skills) + size(similar_missed_skills)*0.5) / size(required_skills), 3) as coverage_score,
                missed_skills,
                similar_missed_skills
            ORDER BY coverage_score DESC;
            `
            return session.run(
                query, params
            ).then (result => result.records.map(record => 
                {
                    return {
                        project: record.get('project').properties,
                        person: record.get('person').properties,
                        missed_skills: record.get('missed_skills'),
                        similar_missed_skills: record.get('similar_missed_skills'),
                        coverage_score: record.get('coverage_score')
                    }
                })
            )

        }
    },

    Project: {

        matchPeople: (project: any) => {
            let session = context().driver.session();
            let params = {name: project.name};
            let query = `
            MATCH (p: Person)-[:HAS_SKILL]->(s:Skill)<-[:USES_SKILL]-(pr: Project)
                WHERE toLower(pr.name) = toLower($name)
            MATCH (pr)-[:USES_SKILL]->(req_skill:Skill)
            MATCH (p)-[:HAS_SKILL]-(had_skills:Skill)
            WITH 
                p, 
                pr, 
                COLLECT(DISTINCT s.name) AS shared_skills, 
                COLLECT(DISTINCT req_skill.name) AS required_skills, 
                COLLECT(DISTINCT had_skills.name) AS had_skills
            UNWIND had_skills AS hs
            UNWIND required_skills as rs
            UNWIND shared_skills as ss
            MATCH (parent:Skill)<-[:HAS_PARENT_SKILL]-(child:Skill) WHERE (child.name IN [skill in required_skills WHERE NOT skill IN had_skills])
            MATCH (parent)-[:CONTAINS_SKILL]->(sub_skill:Skill)
            WHERE (NOT sub_skill.name IN ss) AND (sub_skill.name in hs) AND (NOT sub_skill.name IN rs)

            WITH 
                p, 
                pr, 
                required_skills, 
                COLLECT(DISTINCT sub_skill.name) AS similar_missed_skills, 
                had_skills, 
                shared_skills, 
                [skill in required_skills WHERE NOT skill IN had_skills] AS missed_skills
            RETURN 
                p AS people, 
                pr AS project, 
                round(toFloat(size(shared_skills) + size(similar_missed_skills)*0.5) / size(required_skills), 3) as coverage_score,
                missed_skills,
                similar_missed_skills
            ORDER BY coverage_score DESC;
            `
            return session.run(
                query, params
            ).then (result => result.records.map(record => 
                {
                    return {
                        project: record.get('project').properties,
                        people: record.get('people').properties,
                        missed_skills: record.get('missed_skills'),
                        similar_missed_skills: record.get('similar_missed_skills'),
                        coverage_score: record.get('coverage_score')
                    }
                })
            )

        }
    },
};

  
  
  
  
  


