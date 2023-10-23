import { ApolloServer, gql } from "apollo-server";
import { db } from "./database.js";

let {tweets, users} = db;
const typeDefs = gql`
    """
    사용자 정보를 나타냅니다.
    """
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        fullName: String!
    }

    """
    게시글을 나타냅니다.
    """
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    
    type Query {
        """
        모든 트윗을 가져옵니다.
        """
        allTweets: [Tweet!]!

        """
        지정한 :id의 트윗을 가져옵니다.
        """
        tweet(id: ID!): Tweet
        
        """
        모든 사용자의 정보를 가져옵니다.
        """
        allUsers: [User!]!
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet
        deleteTweet(id: ID!): Boolean
    }
`;

const resolvers = {
    Query: {
        allTweets: () => tweets,
        tweet: (_, {id}) => tweets.find(t => t.id === id),
        allUsers: () => users
    },
    Mutation: {
        postTweet(_, {text, userId}) {
            const newTweet = {
                id: tweets.length + 1,
                text,
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, {id}) {
            const tweet = tweets.find(tweet => tweet.id === id);
            if (!tweet) return false;
            tweets = tweets.filter( t => t.id !== tweet.id );
            return true;
        }
    },
    User: {
        fullName: ({firstName, lastName}) => firstName + " " + lastName
    },
    Tweet: {
        author({userId}) {
            return users.find(u => u.id === userId)
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
})