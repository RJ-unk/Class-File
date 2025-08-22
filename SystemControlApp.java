import java.awt.*;
import java.awt.event.ActionEvent;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import javax.swing.*;
import javax.swing.border.EmptyBorder;

public class SystemControlApp extends JFrame {

    private JTextField searchField;
    private JComboBox<String> actionComboBox;

    public SystemControlApp() {
        setTitle("Advanced System Control Panel");
        setSize(450, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(false);

        // Main Panel with padding
        JPanel panel = new JPanel();
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBackground(new Color(240, 240, 240));

        // Title Label
        JLabel titleLabel = new JLabel("System Control Panel");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 24));
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        panel.add(titleLabel);
        panel.add(Box.createVerticalStrut(20));

        // Action ComboBox
        String[] actions = {"Select Action", "Shutdown", "Log Off", "Sleep", "Open Notepad", "Open Calculator", "Open Browser"};
        actionComboBox = new JComboBox<>(actions);
        actionComboBox.setMaximumSize(new Dimension(200, 30));
        actionComboBox.setAlignmentX(Component.CENTER_ALIGNMENT);
        panel.add(actionComboBox);
        panel.add(Box.createVerticalStrut(10));

        // Execute Button
        JButton executeBtn = new JButton("Execute");
        executeBtn.addActionListener(this::executeSelectedAction);
        executeBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
        panel.add(executeBtn);
        panel.add(Box.createVerticalStrut(20));

        // Search Panel
        JPanel searchPanel = new JPanel(new BorderLayout(5, 5));
        searchField = new JTextField();
        JButton searchBtn = new JButton("Search");

        searchBtn.addActionListener(e -> performWebSearch());

        searchPanel.add(new JLabel("Search Google:"), BorderLayout.WEST);
        searchPanel.add(searchField, BorderLayout.CENTER);
        searchPanel.add(searchBtn, BorderLayout.EAST);

        panel.add(searchPanel);

        add(panel);
    }

    private void executeSelectedAction(ActionEvent e) {
        String selectedAction = (String) actionComboBox.getSelectedItem();
        if (selectedAction != null) {
            switch (selectedAction) {
                case "Shutdown":
                    confirmAndExecute("Shutdown", "shutdown -s -t 0");
                    break;
                case "Log Off":
                    confirmAndExecute("Log Off", "shutdown -l");
                    break;
                case "Sleep":
                    confirmAndExecute("Sleep", "Rundll32.exe powrprof.dll,SetSuspendState Sleep");
                    break;
                case "Open Notepad":
                    executeCommand("notepad");
                    break;
                case "Open Calculator":
                    executeCommand("calc");
                    break;
                case "Open Browser":
                    openURL("http://www.google.com");
                    break;
                default:
                    JOptionPane.showMessageDialog(this, "Please select a valid action.", "Action Error", JOptionPane.WARNING_MESSAGE);
            }
        }
    }

    private void confirmAndExecute(String actionName, String command) {
        int result = JOptionPane.showConfirmDialog(this,
                "Are you sure you want to " + actionName + "?",
                actionName + " Confirmation",
                JOptionPane.YES_NO_OPTION);

        if (result == JOptionPane.YES_OPTION) {
            executeCommand(command);
        }
    }

    private void executeCommand(String command) {
        try {
            Runtime.getRuntime().exec(command);
        } catch (IOException ex) {
            showError(ex);
        }
    }

    private void openURL(String url) {
        try {
            Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler " + url);
        } catch (IOException ex) {
            showError(ex);
        }
    }

 private void performWebSearch() {
    String query = searchField.getText().trim();
    if (!query.isEmpty()) {
        String urlToOpen;

        if (isLikelyURL(query)) {
            if (!query.startsWith("http://") && !query.startsWith("https://")) {
                urlToOpen = "http://" + query;
            } else {
                urlToOpen = query;
            }
        } else if (query.toLowerCase().startsWith("youtube ")) {
            // If input starts with "youtube " then search inside YouTube
            String youtubeQuery = query.substring(8).trim(); // remove "youtube " prefix
            String encodedQuery = URLEncoder.encode(youtubeQuery, StandardCharsets.UTF_8);
            urlToOpen = "https://www.youtube.com/results?search_query=" + encodedQuery;
        } else {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            urlToOpen = "https://www.google.com/search?q=" + encodedQuery;
        }

        openURL(urlToOpen);
    } else {
        JOptionPane.showMessageDialog(this, "Please enter a search query.", "Search Error", JOptionPane.WARNING_MESSAGE);
    }
}


// Helper method to detect if string looks like a URL
private boolean isLikelyURL(String input) {
    return input.contains(".") && !input.contains(" ");
}

    private void showError(Exception ex) {
        JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new SystemControlApp().setVisible(true));
    }
}
