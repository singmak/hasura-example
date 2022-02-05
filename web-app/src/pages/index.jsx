import React from "react";
import { gql, useQuery } from '@apollo/client';

import { Layout } from "../components/layout";

const USERS = gql`
query GetUser {
  user {
    full_name
  }
}
`;

export const Index = () => {

const { loading, error, data } = useQuery(USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <Layout>
      You are logged in as "{data.user[0].full_name}"
    </Layout>
  )
};