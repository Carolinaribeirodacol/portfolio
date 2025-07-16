import { Modal } from "@mantine/core";
import { ReactNode } from "react";

type DefaultModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: string;
};

export function DefaultModal({
  opened,
  onClose,
  title = "Título",
  children,
  size = "md",
}: DefaultModalProps) {
  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={title}
        size={size}
        centered
      >
        {children}
      </Modal>
    </>
  );
}
