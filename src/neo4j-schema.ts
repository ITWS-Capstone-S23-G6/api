import { gql } from "graphql-tag";

export const typeDefs = gql`

  type Skill {
    id: ID @id
    name: String!
    category: String
    parentSkill: String
    parentSkillId: ID @id
    subSkills: [Skill!]! @relationship(type: "CONTAINS_SKILL", direction: OUT)
    knownBy: [Person!]! @relationship(type: "HAS_SKILL", direction: IN)
    usedBy: [Project!]! @relationship(type: "USES_SKILL", direction: IN)
  }

  type Person {
    id: ID @id
    name: String!
    hasSkills: [Skill!]! @relationship(type: "HAS_SKILL", direction: OUT)
  }


  type Project {
    id: ID @id
    name: String!
    useSkills: [Skill!]! @relationship(type: "USES_SKILL", direction: OUT)
  }

  input SkillInput {
    name: String!
    description: String!
    parentSkillId: ID
    parentSkillName: String
    category: String!
  }

  input PersonInput {
    id: ID 
    name: String!
  }

  input ProjectInput {
    id: ID 
    name: String!
  }


`;

// unfinished mutation to help with data input, unnecessary tho since most
// can be done with graphql queries on the frontend
// export const resolver = () => {
//     Mutation: {

//     }
// }


