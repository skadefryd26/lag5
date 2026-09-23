import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Text } from "@mantine/core";
import { adjustScores } from "../api/scoreAdjustmentApi";

type AdminScoreModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function AdminScoreModal({ opened, onClose }: AdminScoreModalProps) {
  const [annoyanceScore, setAnnoyanceScore] = useState<number | string>("");
  const [exhaustionScore, setExhaustionScore] = useState<number | string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (opened) {
      setAnnoyanceScore("");
      setExhaustionScore("");
      setError(null);
    }
  }, [opened]);

  async function handleSubmit() {
    const scores = {
      ...(annoyanceScore !== "" ? { annoyanceScore: Number(annoyanceScore) } : {}),
      ...(exhaustionScore !== "" ? { exhaustionScore: Number(exhaustionScore) } : {}),
    };

    if (Object.keys(scores).length === 0) {
      setError("Oppgi minst én score.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await adjustScores(scores);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Kunne ikke lagre score.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Admin: juster score" centered>
      <Stack>
        <Text size="sm" c="dimmed">
          Verdiene brukes som startpunkt for neste melding. La et felt stå tomt for å la den være uendret.
        </Text>
        <NumberInput
          label="annoyanceScore"
          placeholder="0–100"
          min={0}
          max={100}
          allowDecimal={false}
          value={annoyanceScore}
          onChange={setAnnoyanceScore}
        />
        <NumberInput
          label="exhaustionScore"
          placeholder="0–100"
          min={0}
          max={100}
          allowDecimal={false}
          value={exhaustionScore}
          onChange={setExhaustionScore}
        />
        {error && <Text c="red" size="sm">{error}</Text>}
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>Avbryt</Button>
          <Button onClick={handleSubmit} loading={isSaving} color="orange">Sett score</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
