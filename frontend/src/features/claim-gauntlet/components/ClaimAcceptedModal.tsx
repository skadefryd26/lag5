import type { CSSProperties } from "react";
import { Modal, Stack, Text, ThemeIcon, Button } from "@mantine/core";

type ClaimAcceptedModalProps = {
  opened: boolean;
  energyScore: number;
  onNewClaim: () => void;
};

const CONFETTI = Array.from({ length: 22 }, (_, index) => index);

export function ClaimAcceptedModal({ opened, energyScore, onNewClaim }: ClaimAcceptedModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={() => undefined}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      overlayProps={{ backgroundOpacity: 0.82, blur: 5 }}
      classNames={{ content: "claim-accepted-modal", body: "claim-accepted-modal__body" }}
    >
      <div className="claim-accepted-modal__confetti" aria-hidden="true">
        {CONFETTI.map((piece) => (
          <span key={piece} style={{ "--confetti-index": piece } as CSSProperties} />
        ))}
      </div>
      <Stack align="center" gap="sm" ta="center">
        <ThemeIcon size={92} radius="xl" color="yellow" variant="light" className="claim-accepted-modal__trophy">
          <span role="img" aria-label="Trofe">🏆</span>
        </ThemeIcon>
        <Text size="xs" tt="uppercase" fw={800} c="orange.4" lts="0.16em">
          Skademeldingen er godtatt
        </Text>
        <Text fw={900} size="2.4rem" lh={1} className="claim-accepted-modal__title">
          Gratulerer
        </Text>
        <Text c="dimmed" maw={360}>
          {energyScore === 0
            ? "Du tappet Bjarne for all energi og vant kampen."
            : "Bjarne godtok skademeldingen din. Motvillig, men likevel."}
        </Text>
        <Button onClick={onNewClaim} size="md" color="orange" fullWidth mt="sm">
          Meld en ny skade
        </Button>
      </Stack>
    </Modal>
  );
}
