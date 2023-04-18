import { gql } from "graphql-tag";
import { context } from "./server.js";

export const typeDefs = gql`


  type Skill {
    id: ID @id
    name: String! @unique
    category: String
  }

  type Person {
    id: ID @id
    name: String!
    hasSkills: [String]
    matchProjects: [MatchResult] 
  }


  type Project {
    id: ID @id
    name: String! @unique
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

  type MatchResult {
    person: Person
    project: Project
    coverage_score: Float!
  }

#   type Query {
#     matchProjects(personName: String!): [MatchResult] 
#   }

`;

export const resolvers = {
    Person: {
        hasSkills: (person: any) => {
            let session = context().driver.session();
            let params = {name: person.name};
            return session.run(
                `MATCH (p: Person {name: $name})-[:HAS_SKILL]->(s: Skill) 
                return s.name as skillNames`
            , params).then( 
                result => {return result.records.map(record => {return record.get("skillNames")})}
            )
        },

        matchProjects: (person: any) => {
            let session = context().driver.session();
            let params = {name: person.name};
            let query = `
            MATCH (p:Person)-[:HAS_SKILL]->(s:Skill)<-[:USES_SKILL]-(pr:Project)
                WHERE p.name CONTAINS $name
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
                similar_missed_skills,
            ORDER BY coverage_score DESC;
            `
            return session.run(
                query, params
            ).then (result => result.records.map(record => 
                {
                    return {
                        project: record.get('project').properties,
                        person: record.get('person').properties,
                        coverage_score: record.get('coverage_score')
                    }
                })
            )

        }
    },

    // Project: {
    //     useSkills: (project: any) => {
    //         let session = context().driver.session();
    //         let params = {name: project.name};
    //         let query = `
    //             MATCH (p: Project {name: $name})-[:USES_SKILL]->(s: Skill) 
    //             RETURN s AS skills;
    //         `
    //         return session.run(query, params).then( 
    //             result => {return result.records.map(record => {return record.get("skills")})}
    //         )
    //     }
    // }
};

  
  
  
  
  


