import { gql } from "graphql-tag";

export const typeDefs = gql`

  type Skill {
    id: ID @id
    name: String! @unique
    category: String
  }

  type Person {
    id: ID @id
    name: String!
    hasSkills: [Skill!]! @relationship(type: "HAS_SKILL", direction: OUT)
  }


  type Project {
    id: ID @id
    name: String! @unique
    useSkills: [Skill!]! @relationship(type: "USES_SKILL", direction: OUT)
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


`;

// unfinished mutation to help with data input, unnecessary tho since most
// can be done with graphql queries on the frontend
// export const resolver = () => {
//     Mutation: {

//     }
// }


