import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client/react';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery, gql } from '@apollo/client';


// appollo client will connect to the graphql server
const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance',
  cache: new InMemoryCache()
});


// you can directly query the client with a query
client
  .query({
    query: gql`
      query GetVaults {
        vaults {
          id
        }
      }
    `
  })
  .then(result => console.log(result));

// create predefined queries
const VAULTS_QUERY = gql`
  query GetVaults {
    vaults {
      id
    }
  }
`;

// create a predifined query with a variable
// finds the last 5 deposits to the vault (orderd by the timestamp)
const DEPOSITS_VAULT_QUERY = gql`
  query DepositsVault($vault: String!) {
    vault(id:$vault){
        id
        deposits(first: 5, orderBy: timestamp, orderDirection: desc){
          id
          timestamp
          user{
            id
          }
          amount
        }
      }
  }
`

// returns 5 most recent withdrawals for given user
const WITHDRAWALS_USER_QUERY = gql`
  query WithdrawalsUser($user: String!) {
    user(id:$user){
        id
        withdrawals(first: 5, orderBy: timestamp, orderDirection: desc){
          id
          vault{
            id
          }
          timestamp
          amount
        }
      }
  }
`


function Vaults() {
  // call the predefined vaults query which returns all vaults
  const { loading, error, data } = useQuery(VAULTS_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.vaults.map(({ id }) => (
    <div key={id}>
      <p>
        {id}
      </p>
    </div>
  ));
}


function Deposits() {
  // call the predefined deposits vault query
  // wich finds all deposits for a vault passed as argument
  const { loading, error, data } = useQuery(DEPOSITS_VAULT_QUERY, {
    variables: {
      vault: "0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe"
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.vault.deposits.map(({id, timestamp , user, amount}) => (
    <div key={id}>
      <p>
        {user.id} : {timestamp} : {amount}
      </p>
    </div>
  ));
}


function Withdrawals() {
  // call the predefined deposits vault query
  // wich finds all deposits for a vault passed as argument
  const { loading, error, data } = useQuery(WITHDRAWALS_USER_QUERY, {
    variables: {
      user: "0x9d28fc41ffbb91da1f460d5c9574d4e7c5b23909"
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.user.withdrawals.map(({id, vault, timestamp , amount}) => (
    <div key={id}>
      <p>
        {vault.id} : {timestamp} : {amount}
      </p>
    </div>
  ));
}


ReactDOM.render(
  // wrap toplevel with AppoloProvider to provide the 'useQuery' to lower levels
  <ApolloProvider client={client}>
    <div>
      <p>
        All vaults currently mapped:
      </p>
    </div>
    <Vaults />
    <div>
      <p>
        Last 5 deposits for a specific vault:
      </p>
    </div>
    <Deposits />
    <div>
      <p>
        Withdrawals for a given user:
      </p>
    </div>
    <Withdrawals />
  </ApolloProvider>,
  document.getElementById('root'),
);
