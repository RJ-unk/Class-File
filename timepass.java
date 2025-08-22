class timepass {
  public static void main(String[] args) {

    // get the name of operating system
    String name = System.getProperty("os.name");
    String core = System.getProperty("os.core");
    String soft = System.getProperty("os.software");
    System.out.println(name);
    System.out.println(core);
    System.out.println(soft);

  }
}