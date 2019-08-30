import React from "react"
import { useAuth } from "react-use-auth"
import { Button, Box } from "rebass"
import { useMutation } from "react-apollo-hooks"
import { BarLoader } from "react-spinners"

import { CREATE_ALBUM } from "../queries"

const CreateAlbum = ({ userId }) => {
  const [createAlbum, { data, loading }] = useMutation(CREATE_ALBUM, {
    variables: { userId },
  })

  console.log(data)

  return (
    <Box m={[2, 3, 4]}>
      <Button variant="secondary" onClick={createAlbum}>
        Create new album
      </Button>
      {loading ? <BarLoader height={4} width={169} /> : null}
    </Box>
  )
}

const CreateAlbumButton = () => {
  const { isAuthenticated, user, login } = useAuth()

  if (isAuthenticated()) {
    return <CreateAlbum userId={user.sub} />
  } else {
    return (
      <Button onClick={login} variant="secondary" m={[2, 3, 4]}>
        Create your first album
      </Button>
    )
  }
}

export default CreateAlbumButton
