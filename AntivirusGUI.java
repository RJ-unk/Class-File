import java.awt.*;
import java.io.*;
import javax.swing.*;

public class AntivirusGUI extends JFrame {
    private JTextArea outputArea;

    public AntivirusGUI() {
        setTitle("Code Issue Teller");
        setSize(600, 400);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        JButton scanButton = new JButton("Check Code");
        outputArea = new JTextArea();
        outputArea.setEditable(false);

        scanButton.addActionListener(e -> chooseAndScanFile());

        add(scanButton, BorderLayout.NORTH);
        add(new JScrollPane(outputArea), BorderLayout.CENTER);
    }

    private void chooseAndScanFile() {
        JFileChooser fileChooser = new JFileChooser();
        int option = fileChooser.showOpenDialog(this);

        if (option == JFileChooser.APPROVE_OPTION) {
            File file = fileChooser.getSelectedFile();
            checkCodeIssues(file);
        }
    }

    private void checkCodeIssues(File file) {
        outputArea.setText(""); // Clear previous output
        String fileName = file.getName().toLowerCase();

        try {
            ProcessBuilder pb;

            if (fileName.endsWith(".java")) {
                // Compile Java file
                pb = new ProcessBuilder("javac", file.getAbsolutePath());
            } else if (fileName.endsWith(".py")) {
                // Syntax check for Python (compile only)
                pb = new ProcessBuilder("python", "-m", "py_compile", file.getAbsolutePath());
            } else {
                outputArea.setText("Unsupported file type. Only .java and .py are supported.");
                return;
            }

            pb.redirectErrorStream(true);
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            boolean hasErrors = false;

            while ((line = reader.readLine()) != null) {
                hasErrors = true;
                outputArea.append(line + "\n");
            }

            process.waitFor();

            if (!hasErrors) {
                outputArea.append("✅ No syntax/compile errors found!");
            }
        } catch (Exception ex) {
            outputArea.setText("Error during checking:\n" + ex.getMessage());
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new AntivirusGUI().setVisible(true));
    }
}
