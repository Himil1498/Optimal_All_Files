import { Stack, Card, CardContent, Skeleton } from "@mui/material";

export default function CardSkeleton({ count = 5 }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="40%" height={30} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="30%" />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={30}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
